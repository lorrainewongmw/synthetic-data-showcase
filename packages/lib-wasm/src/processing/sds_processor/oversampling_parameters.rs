use serde::{Deserialize, Serialize};
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

use crate::utils::js::JsOversamplingParameters;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[wasm_bindgen]
pub struct WasmOversamplingParameters {
    pub(crate) oversampling_ratio: Option<f64>,
    pub(crate) oversampling_tries: Option<usize>,
}

impl TryFrom<JsOversamplingParameters> for WasmOversamplingParameters {
    type Error = JsValue;

    fn try_from(js_oversampling_params: JsOversamplingParameters) -> Result<Self, Self::Error> {
        js_oversampling_params
            .into_serde::<WasmOversamplingParameters>()
            .map_err(|err| JsValue::from(err.to_string()))
    }
}
