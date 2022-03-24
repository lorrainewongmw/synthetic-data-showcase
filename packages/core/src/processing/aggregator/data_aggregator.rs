use super::aggregated_data::AggregatedData;
use super::rows_aggregator::RowsAggregator;
use super::typedefs::RecordsSet;
use itertools::Itertools;
use log::info;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::data_block::block::DataBlock;
use crate::utils::math::calc_percentage;
use crate::utils::reporting::ReportProgress;
use crate::utils::threading::get_number_of_threads;
use crate::utils::time::ElapsedDurationLogger;

#[cfg(feature = "pyo3")]
use pyo3::prelude::*;

/// Result of data aggregation for each combination
#[cfg_attr(feature = "pyo3", pyclass)]
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AggregatedCount {
    /// How many times the combination appears on the records
    pub count: usize,
    /// Which records this combinations is part of
    pub contained_in_records: RecordsSet,
}

#[cfg(feature = "pyo3")]
#[cfg_attr(feature = "pyo3", pymethods)]
impl AggregatedCount {
    /// How many times the combination appears on the records
    #[getter]
    fn count(&self) -> usize {
        self.count
    }

    /// Which records this combinations is part of
    /// This method will clone the data, so its recommended to have its result stored
    /// in a local variable to avoid it being called multiple times
    fn get_contained_in_records(&self) -> RecordsSet {
        self.contained_in_records.clone()
    }
}

/// Process a data block to produced aggregated data
pub struct Aggregator {
    data_block: Arc<DataBlock>,
}

impl Aggregator {
    /// Returns a data aggregator for the given data block
    /// # Arguments
    /// * `data_block` - The data block to be processed
    #[inline]
    pub fn new(data_block: Arc<DataBlock>) -> Aggregator {
        Aggregator { data_block }
    }

    /// Aggregates the data block and returns the aggregated data back
    /// # Arguments
    /// * `reporting_length` - Calculate combinations from 1 up to `reporting_length`
    /// (0 means no suppression)
    /// * `progress_reporter` - Will be used to report the processing
    /// progress (`ReportProgress` trait). If `None`, nothing will be reported
    pub fn aggregate<T>(
        &mut self,
        reporting_length: usize,
        progress_reporter: &mut Option<T>,
    ) -> AggregatedData
    where
        T: ReportProgress,
    {
        let _duration_logger = ElapsedDurationLogger::new("data aggregation");
        let normalized_reporting_length =
            self.data_block.normalize_reporting_length(reporting_length);
        let total_n_records = self.data_block.records.len();
        let total_n_records_f64 = total_n_records as f64;

        info!(
            "aggregating data with reporting length = {} and {} thread(s)",
            normalized_reporting_length,
            get_number_of_threads()
        );

        let result = RowsAggregator::aggregate_all(
            total_n_records,
            normalized_reporting_length,
            &mut self.build_rows_aggregators(normalized_reporting_length),
            progress_reporter,
        );

        Aggregator::update_aggregate_progress(
            progress_reporter,
            total_n_records,
            total_n_records_f64,
        );

        info!(
            "data aggregated resulting in {} distinct combinations...",
            result.aggregates_count.len()
        );

        AggregatedData::new(
            self.data_block.clone(),
            result.aggregates_count,
            result.records_sensitivity_by_len,
            normalized_reporting_length,
        )
    }

    #[inline]
    fn build_rows_aggregators(&self, reporting_length: usize) -> Vec<RowsAggregator> {
        if self.data_block.records.is_empty() {
            return Vec::default();
        }

        let chunk_size = ((self.data_block.records.len() as f64) / (get_number_of_threads() as f64))
            .ceil() as usize;
        let mut rows_aggregators: Vec<RowsAggregator> = Vec::default();

        for c in &self
            .data_block
            .records
            .clone()
            .drain(..)
            .enumerate()
            .chunks(chunk_size)
        {
            rows_aggregators.push(RowsAggregator::new(
                self.data_block.clone(),
                c.collect(),
                reporting_length,
            ))
        }
        rows_aggregators
    }

    #[inline]
    fn update_aggregate_progress<T>(
        progress_reporter: &mut Option<T>,
        n_processed: usize,
        total: f64,
    ) where
        T: ReportProgress,
    {
        if let Some(r) = progress_reporter {
            r.report(calc_percentage(n_processed as f64, total));
        }
    }
}
