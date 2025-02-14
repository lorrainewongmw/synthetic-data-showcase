use csv::Writer;
use csv::WriterBuilder;
use log::info;
use std::{io::Write, sync::Arc};

#[cfg(feature = "pyo3")]
use pyo3::prelude::*;

#[cfg(feature = "pyo3")]
use crate::data_block::CsvRecord;

use crate::{
    data_block::{
        CsvIOError, DataBlock, MultiValueColumnMetadataMap, RawData, RawDataMultiValueColumnJoiner,
    },
    utils::time::ElapsedDurationLogger,
};

#[cfg_attr(feature = "pyo3", pyclass)]
/// Synthetic data generated by the Generator
pub struct GeneratedData {
    /// Synthesized data - headers (index 0) and records indexes 1...
    pub synthetic_data: RawData,
    /// `Synthetic data length / Sensitive data length` (header not included)
    pub expansion_ratio: f64,
    /// Maps a normalized multi-value header name (such as A_a1) to its corresponding metadata
    pub multi_value_column_metadata_map: MultiValueColumnMetadataMap,
}

impl GeneratedData {
    /// Returns a new GeneratedData struct with default values
    #[inline]
    pub fn default() -> GeneratedData {
        GeneratedData {
            synthetic_data: RawData::default(),
            expansion_ratio: 0.0,
            multi_value_column_metadata_map: MultiValueColumnMetadataMap::default(),
        }
    }

    /// Returns a new GeneratedData struct
    /// # Arguments
    /// * `synthetic_data` - Synthesized data headers (index 0) and records indexes 1...
    /// * `expansion_ratio` - `Synthetic data length / Sensitive data length` (header not included)
    /// * `multi_value_column_metadata_map` - Maps a normalized multi-value header name (such as A_a1)
    /// to its corresponding metadata
    #[inline]
    pub fn new(
        synthetic_data: RawData,
        expansion_ratio: f64,
        multi_value_column_metadata_map: MultiValueColumnMetadataMap,
    ) -> GeneratedData {
        GeneratedData {
            synthetic_data,
            expansion_ratio,
            multi_value_column_metadata_map,
        }
    }

    #[inline]
    fn _write_synthetic_data<T: Write>(
        &self,
        writer: &mut T,
        delimiter: char,
        empty_value: &str,
        join_multi_value_columns: bool,
        long_form: bool,
    ) -> Result<(), CsvIOError> {
        let mut wtr = WriterBuilder::new()
            .delimiter(delimiter as u8)
            .from_writer(writer);
        let joined_synthetic_data;

        let synthetic_data = if join_multi_value_columns {
            joined_synthetic_data = RawDataMultiValueColumnJoiner::new(
                &self.synthetic_data,
                &self.multi_value_column_metadata_map,
                &Arc::new(empty_value.to_owned()),
            )
            .join();
            &joined_synthetic_data
        } else {
            &self.synthetic_data
        };

        // write header and records
        if long_form {
            self._write_synthetic_data_long_format(&mut wtr, synthetic_data, empty_value)
        } else {
            self._write_synthetic_data_raw_format(&mut wtr, synthetic_data)
        }
    }

    #[inline]
    fn _write_synthetic_data_long_format<T: Write>(
        &self,
        wtr: &mut Writer<&mut T>,
        synthetic_data: &RawData,
        empty_value: &str,
    ) -> Result<(), CsvIOError> {
        let col_headers = &synthetic_data[0];
        let long_form_headers = ["Id", "Attribute", "Value", "AttributeValue"];

        match wtr.write_record(long_form_headers) {
            Ok(_) => {}
            Err(err) => return Err(CsvIOError::new(err)),
        };

        for (row_idx, r) in synthetic_data.iter().skip(1).enumerate() {
            for (col_idx, value) in r.iter().enumerate() {
                // do not write empty values to long format
                if (**value) != *empty_value {
                    let long_form_row = [
                        &row_idx.to_string(),
                        &col_headers[col_idx],
                        value,
                        &format!("{}:{}", col_headers[col_idx], value),
                    ];
                    match wtr.write_record(long_form_row) {
                        Ok(_) => {}
                        Err(err) => return Err(CsvIOError::new(err)),
                    };
                }
            }
        }
        Ok(())
    }

    #[inline]
    fn _write_synthetic_data_raw_format<T: Write>(
        &self,
        wtr: &mut Writer<&mut T>,
        synthetic_data: &RawData,
    ) -> Result<(), CsvIOError> {
        for r in synthetic_data.iter() {
            match wtr.write_record(r.iter().map(|v| v.as_str())) {
                Ok(_) => {}
                Err(err) => return Err(CsvIOError::new(err)),
            };
        }
        Ok(())
    }
}

#[cfg_attr(feature = "pyo3", pymethods)]
impl GeneratedData {
    #[cfg(feature = "pyo3")]
    /// Synthesized data - headers (index 0) and records indexes 1...
    /// This method will clone the data, so its recommended to have its result stored
    /// in a local variable to avoid it being called multiple times
    fn get_synthetic_data(&self) -> Vec<CsvRecord> {
        self.synthetic_data
            .iter()
            .map(|row| row.iter().map(|value| (**value).clone()).collect())
            .collect()
    }

    #[cfg(feature = "pyo3")]
    #[getter]
    /// `Synthetic data length / Sensitive data length` (header not included)
    fn expansion_ratio(&self) -> f64 {
        self.expansion_ratio
    }

    /// Writes the synthesized data to the file system
    /// # Arguments
    /// * `path` - File path to be written
    /// * `delimiter` - Delimiter to use when writing to `path`
    /// * `empty_value` - Empty values will be replaced by this
    /// * `join_multi_value_columns` - Whether multi value columns should be joined back together or not
    /// * `long_form` - Pivots column headers and value pairs to key-value row entries.
    pub fn write_synthetic_data(
        &self,
        path: &str,
        delimiter: char,
        empty_value: &str,
        join_multi_value_columns: bool,
        long_form: bool,
    ) -> Result<(), CsvIOError> {
        let _duration_logger = ElapsedDurationLogger::new("write synthetic data");

        let mut file = std::io::BufWriter::new(
            std::fs::File::create(path).map_err(|err| CsvIOError::new(csv::Error::from(err)))?,
        );

        info!("writing file {}", path);

        self._write_synthetic_data(
            &mut file,
            delimiter,
            empty_value,
            join_multi_value_columns,
            long_form,
        )
    }

    /// Generates a CSV string from the synthetic data
    /// # Arguments
    /// * `delimiter` - CSV delimiter to use
    /// * `empty_value` - Empty values will be replaced by this
    /// * `join_multi_value_columns` - Whether multi value columns should be joined back together or not
    /// * `long_form` - Pivots column headers and value pairs to key-value row entries.
    pub fn synthetic_data_to_string(
        &self,
        delimiter: char,
        empty_value: &str,
        join_multi_value_columns: bool,
        long_form: bool,
    ) -> Result<String, CsvIOError> {
        let mut csv_data = Vec::default();

        self._write_synthetic_data(
            &mut csv_data,
            delimiter,
            empty_value,
            join_multi_value_columns,
            long_form,
        )?;

        Ok(String::from_utf8_lossy(&csv_data).to_string())
    }

    /// Clones the raw synthetic data to a `Vec<Vec<String>>`,
    /// where the first entry is the headers
    /// # Arguments
    /// * `empty_value` - Empty values will be replaced by this
    /// * `join_multi_value_columns` - Whether multi value columns should be joined back together or not
    pub fn synthetic_data_to_vec(
        &self,
        empty_value: &str,
        join_multi_value_columns: bool,
    ) -> Vec<Vec<String>> {
        DataBlock::raw_data_to_vec(
            &self.synthetic_data,
            &Arc::new(empty_value.to_owned()),
            &self.multi_value_column_metadata_map,
            join_multi_value_columns,
        )
    }
}
