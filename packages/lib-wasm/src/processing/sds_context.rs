use super::{
    evaluator::evaluate_result::WasmEvaluateResult, generator::generate_result::WasmGenerateResult,
    navigator::navigate_result::WasmNavigateResult, sds_processor::SDSProcessor,
};
use log::debug;
use wasm_bindgen::{prelude::*, JsCast};

use crate::utils::js::ts_definitions::{
    JsAggregateResult, JsAttributesIntersectionByColumn, JsEvaluateResult, JsGenerateResult,
    JsHeaderNames, JsReportProgressCallback, JsResult, JsSelectedAttributesByColumn,
};

#[wasm_bindgen]
pub struct SDSContext {
    delimiter: char,
    use_columns: JsHeaderNames,
    sensitive_zeros: JsHeaderNames,
    record_limit: usize,
    sensitive_processor: SDSProcessor,
    generate_result: WasmGenerateResult,
    resolution: usize,
    synthetic_processor: SDSProcessor,
    evaluate_result: WasmEvaluateResult,
    navigate_result: WasmNavigateResult,
}

#[wasm_bindgen]
impl SDSContext {
    #[wasm_bindgen(constructor)]
    pub fn default() -> SDSContext {
        SDSContext {
            delimiter: ',',
            use_columns: JsHeaderNames::default(),
            sensitive_zeros: JsHeaderNames::default(),
            record_limit: 0,
            sensitive_processor: SDSProcessor::default(),
            generate_result: WasmGenerateResult::default(),
            resolution: 0,
            synthetic_processor: SDSProcessor::default(),
            evaluate_result: WasmEvaluateResult::default(),
            navigate_result: WasmNavigateResult::default(),
        }
    }

    #[wasm_bindgen(js_name = "clearSensitiveData")]
    pub fn clear_sensitive_data(&mut self) {
        self.delimiter = ',';
        self.use_columns = JsHeaderNames::default();
        self.sensitive_zeros = JsHeaderNames::default();
        self.record_limit = 0;
        self.sensitive_processor = SDSProcessor::default();
        self.clear_generate();
    }

    #[wasm_bindgen(js_name = "clearGenerate")]
    pub fn clear_generate(&mut self) {
        self.generate_result = WasmGenerateResult::default();
        self.resolution = 0;
        self.synthetic_processor = SDSProcessor::default();
        self.clear_evaluate()
    }

    #[wasm_bindgen(js_name = "clearEvaluate")]
    pub fn clear_evaluate(&mut self) {
        self.evaluate_result = WasmEvaluateResult::default();
        self.clear_navigate()
    }

    #[wasm_bindgen(js_name = "clearNavigate")]
    pub fn clear_navigate(&mut self) {
        self.navigate_result = WasmNavigateResult::default();
    }

    #[wasm_bindgen(js_name = "setSensitiveData")]
    pub fn set_sensitive_data(
        &mut self,
        csv_data: &str,
        delimiter: char,
        use_columns: JsHeaderNames,
        sensitive_zeros: JsHeaderNames,
        record_limit: usize,
    ) -> JsResult<()> {
        debug!("setting sensitive data...");

        self.delimiter = delimiter;
        self.use_columns = use_columns;
        self.sensitive_zeros = sensitive_zeros;
        self.record_limit = record_limit;
        self.sensitive_processor = SDSProcessor::new(
            csv_data,
            self.delimiter,
            self.use_columns.clone().unchecked_into(),
            self.sensitive_zeros.clone().unchecked_into(),
            self.record_limit,
        )?;
        self.clear_generate();
        Ok(())
    }

    pub fn generate(
        &mut self,
        cache_max_size: usize,
        resolution: usize,
        empty_value: String,
        seeded: bool,
        progress_callback: JsReportProgressCallback,
    ) -> JsResult<()> {
        debug!("generating synthetic data...");

        self.generate_result = self.sensitive_processor.generate(
            cache_max_size,
            resolution,
            empty_value,
            seeded,
            progress_callback,
        )?;
        self.resolution = resolution;

        debug!("creating synthetic data processor...");

        self.synthetic_processor = SDSProcessor::new(
            &self.generate_result.synthetic_data_to_js(self.delimiter)?,
            self.delimiter,
            self.use_columns.clone().unchecked_into(),
            self.sensitive_zeros.clone().unchecked_into(),
            0, // always process all the synthetic data
        )?;
        self.clear_evaluate();
        Ok(())
    }

    pub fn evaluate(
        &mut self,
        reporting_length: usize,
        sensitivity_threshold: usize,
        sensitive_progress_callback: JsReportProgressCallback,
        synthetic_progress_callback: JsReportProgressCallback,
    ) -> JsResult<()> {
        debug!("aggregating sensitive data...");

        let sensitive_aggregate_result = self.sensitive_processor.aggregate(
            reporting_length,
            sensitivity_threshold,
            sensitive_progress_callback,
        )?;

        debug!("aggregating synthetic data...");

        let synthetic_aggregate_result = self.synthetic_processor.aggregate(
            reporting_length,
            sensitivity_threshold,
            synthetic_progress_callback,
        )?;

        debug!("evaluating synthetic data based on sensitive data...");

        self.evaluate_result = WasmEvaluateResult::from_aggregate_results(
            sensitive_aggregate_result,
            synthetic_aggregate_result,
        );

        self.clear_navigate();

        Ok(())
    }

    #[wasm_bindgen(js_name = "protectSensitiveAggregatesCount")]
    pub fn protect_sensitive_aggregates_count(&mut self) {
        debug!("protecting sensitive aggregates count...");

        self.evaluate_result
            .protect_sensitive_aggregates_count(self.resolution);
    }

    pub fn navigate(&mut self) {
        debug!("creating navigate result...");

        self.navigate_result =
            WasmNavigateResult::from_synthetic_processor(&self.synthetic_processor);
    }

    #[wasm_bindgen(js_name = "selectAttributes")]
    pub fn select_attributes(&mut self, attributes: JsSelectedAttributesByColumn) -> JsResult<()> {
        self.navigate_result.select_attributes(attributes)
    }

    #[wasm_bindgen(js_name = "attributesIntersectionsByColumn")]
    pub fn attributes_intersections_by_column(
        &mut self,
        columns: JsHeaderNames,
    ) -> JsResult<JsAttributesIntersectionByColumn> {
        self.navigate_result.attributes_intersections_by_column(
            columns,
            &self.evaluate_result.sensitive_aggregate_result,
        )
    }

    #[wasm_bindgen(js_name = "generateResultToJs")]
    pub fn generate_result_to_js(&self) -> JsResult<JsGenerateResult> {
        self.generate_result.to_js(self.delimiter)
    }

    #[wasm_bindgen(js_name = "evaluateResultToJs")]
    pub fn evaluate_result_to_js(
        &self,
        aggregates_delimiter: char,
        combination_delimiter: &str,
        include_aggregates_data: bool,
    ) -> JsResult<JsEvaluateResult> {
        self.evaluate_result.to_js(
            aggregates_delimiter,
            combination_delimiter,
            self.resolution,
            include_aggregates_data,
        )
    }

    #[wasm_bindgen(js_name = "sensitiveAggregateResultToJs")]
    pub fn sensitive_aggregate_result_to_js(
        &self,
        aggregates_delimiter: char,
        combination_delimiter: &str,
        include_aggregates_data: bool,
    ) -> JsResult<JsAggregateResult> {
        self.evaluate_result.sensitive_aggregate_result_to_js(
            aggregates_delimiter,
            combination_delimiter,
            self.resolution,
            include_aggregates_data,
        )
    }

    #[wasm_bindgen(js_name = "syntheticAggregateResultToJs")]
    pub fn synthetic_aggregate_result_to_js(
        &self,
        aggregates_delimiter: char,
        combination_delimiter: &str,
        include_aggregates_data: bool,
    ) -> JsResult<JsAggregateResult> {
        self.evaluate_result.synthetic_aggregate_result_to_js(
            aggregates_delimiter,
            combination_delimiter,
            self.resolution,
            include_aggregates_data,
        )
    }
}
