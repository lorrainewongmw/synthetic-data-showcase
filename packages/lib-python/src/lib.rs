//! This crate will generate python bindings for the main features
//! of the `sds_core` library.
use data_processor::SDSProcessor;
use pyo3::prelude::*;
use sds_core::{
    processing::{aggregator::aggregated_data, evaluator},
    utils::threading,
};

/// Module that exposes the main processor
pub mod data_processor;

/// A Python module implemented in Rust. The name of this function must match
/// the `lib.name` setting in the `Cargo.toml`, else Python will not be able to
/// import the module.
#[pymodule]
fn sds(py: Python, m: &PyModule) -> PyResult<()> {
    env_logger::init();
    m.add_class::<SDSProcessor>()?;
    threading::register(py, m)?;
    aggregated_data::register(py, m)?;
    evaluator::register(py, m)?;
    Ok(())
}
