// Reference cases for tools/check_app.py. Each tool's cases are values
// checked by hand, against a standard or a datasheet, when it was reviewed;
// the check replays them so a later change cannot quietly break them.
//
// A case: { name, do: [steps], expect: [[selector, text]] }
//   steps:  ["set", selector, value]  types into a field or picks a <select>
//           ["click", selector]       clicks (a roller colour, a button)
//           ["pill", index]           picks a mode pill
//   expect: the element's text (an <input>'s value) must equal the text, or
//           match it when written as "/regex/".
const CHECK_CASES = {
  "resistor-color-code": [
    { name: "4.7 k is yellow violet red", do: [["set", "#cc-unit", "kΩ"], ["set", "#cc-value", "4.7"]],
      expect: [['[data-value="d1"]', "4"], ['[data-value="d2"]', "7"], ['[data-value="mult"]', "×100"]] },
    { name: "0.22 Ω uses a silver multiplier", do: [["set", "#cc-unit", "Ω"], ["set", "#cc-value", "0.22"]],
      expect: [['[data-value="mult"]', "×0.01"]] },
    { name: "grey is ±0.01% (IEC 60062:2016)", do: [["set", "#cc-unit", "kΩ"], ["set", "#cc-value", "1"], ["set", "#cc-tol", "grey"]],
      expect: [['[data-res="tol"]', "±0.01%"], ['[data-res="sub"]', "999.9 Ω – 1.0001 kΩ"]] },
  ],
  "smd-code": [
    { name: "334 is 330 k", do: [["set", "#smd-code", "334"]], expect: [['[data-res="ohms"]', "330 kΩ"]] },
    { name: "0 is a zero-ohm link", do: [["set", "#smd-code", "0"]], expect: [['[data-res="ohms"]', "0 Ω"]] },
    { name: "4992 is 49.9 k", do: [["pill", 1], ["set", "#smd-code", "4992"]], expect: [['[data-res="ohms"]', "49.9 kΩ"]] },
    { name: "10 mΩ marks R010", do: [["pill", 1], ["set", "#smd-unit", "Ω"], ["set", "#smd-value", "0.01"]], expect: [["#smd-code", "R010"]] },
    { name: "EIA-96 01C is 10 k", do: [["pill", 2], ["set", "#smd-code", "01C"]], expect: [['[data-res="ohms"]', "10 kΩ"]] },
  ],
  "e-series": [
    { name: "9.2 k is E192 (IEC 60063's 920)", do: [["pill", 5], ["set", "#es-unit", "kΩ"], ["set", "#es-value", "9.2"]],
      expect: [['[data-res="drift"]', "E192 standard value, exactly"]] },
    { name: "97 k rounds up, highlighted", do: [["pill", 2], ["set", "#es-unit", "kΩ"], ["set", "#es-value", "97"]],
      expect: [['[data-res="ohms"]', "100 kΩ"], [".eseries-cell.hit", "100 kΩ"]] },
  ],
  "series-parallel": [
    { name: "1 k + 1 k", do: [], expect: [['[data-res="total"]', "2 kΩ"]] },
    { name: "1 k ∥ 1 k", do: [["pill", 1]], expect: [['[data-res="total"]', "500 Ω"]] },
  ],
  "voltage-divider": [
    { name: "12 V, 10 k / 10 k", do: [], expect: [['[data-res="solved"]', "6 V"]] },
    { name: "shorthand 4k7 in a kΩ field is 4.7", do: [["set", 'input[data-var="r2"]', "4k7"]],
      expect: [['input[data-var="r2"]', "4.7"], ['[data-res="solved"]', "3.837 V"]] },
    { name: "a decimal comma is read", do: [["set", 'input[data-var="r2"]', "4,7"]], expect: [['[data-res="solved"]', "3.837 V"]] },
    { name: "shorthand in an Ω field", do: [["set", 'select[data-unit="r2"]', "Ω"], ["set", 'input[data-var="r2"]', "4k7"]],
      expect: [['input[data-var="r2"]', "4700"], ['[data-res="solved"]', "3.837 V"]] },
    { name: "12 V, 10 k / 4.7 k", do: [["set", 'input[data-var="r2"]', "4.7"]], expect: [['[data-res="solved"]', "3.837 V"]] },
  ],
  "current-divider": [
    { name: "20 mA into 1 k ∥ 2 k", do: [["set", 'input[data-var="r2"]', "2"]], expect: [['[data-res="solved"]', "13.33 mA"]] },
  ],
  "wheatstone-bridge": [
    { name: "1 k, 2 k, 3 k balance with 6 k", do: [["set", 'input[data-var="r2"]', "2"], ["set", 'input[data-var="r3"]', "3"]],
      expect: [['[data-res="solved"]', "6 kΩ"]] },
  ],
  "delta-y": [
    { name: "10, 20, 30 Ω delta", do: [["set", 'input[data-var="ab"]', "10"], ["set", 'input[data-var="bc"]', "20"], ["set", 'input[data-var="ca"]', "30"]],
      expect: [['[data-res="a"]', "5 Ω"], ['[data-res="b"]', "3.333 Ω"], ['[data-res="c"]', "10 Ω"]] },
  ],
  "thermistor": [
    { name: "Vishay 10 k, B 3977, at 85 °C", do: [["set", "#th-coef", "3977"], ["set", "#th-temp", "85"]], expect: [["#th-res", "1.07"]] },
    { name: "a typographic minus is read", do: [["set", "#th-coef", "3977"], ["set", "#th-temp", "−20"]], expect: [["#th-res", "107.1"]] },
    { name: "the ± key makes it negative", do: [["set", "#th-coef", "3977"], ["set", "#th-temp", "20"], ["click", "#th-temp + .sign-btn"]],
      expect: [["#th-temp", "-20"], ["#th-res", "107.1"]] },
  ],
  "ceramic-code": [
    { name: "104 is 100 nF", do: [["set", "#cer-code", "104"]], expect: [['[data-res="value"]', "100 nF"]] },
    { name: "479 is 4.7 pF (EIA-198 ×0.1)", do: [["set", "#cer-code", "479"]], expect: [['[data-res="value"]', "4.7 pF"]] },
    { name: "101D is ±0.5% above 10 pF", do: [["set", "#cer-code", "101D"]], expect: [['[data-res="tol"]', "±0.5%"]] },
  ],
  "film-code": [
    { name: "102H is ±2.5%", do: [["set", "#film-code", "102H"]], expect: [['[data-res="value"]', "1 nF"], ['[data-res="tol"]', "±2.5%"]] },
    { name: "4N7J reads case-blind", do: [["pill", 1], ["set", "#film-code", "4N7J"]], expect: [['[data-res="value"]', "4.7 nF"], ['[data-res="tol"]', "±5%"]] },
  ],
  "cap-smd-code": [
    { name: "227A (AVX TAJ)", do: [["set", "#csmd-code", "227A"]], expect: [['[data-res="value"]', "220 µF"], ['[data-res="letter"]', "Rated 10V"]] },
    { name: "J106, letter first", do: [["set", "#csmd-code", "J106"]], expect: [['[data-res="value"]', "10 µF"], ['[data-res="letter"]', "Rated 6.3V"]] },
  ],
  "cap-series-parallel": [
    { name: "100 n ∥ 100 n", do: [], expect: [['[data-res="total"]', "200 nF"]] },
    { name: "100 n in series with 100 n", do: [["pill", 1]], expect: [['[data-res="total"]', "50 nF"]] },
  ],
  "rc-charge": [
    { name: "1 τ reaches 63.21%", do: [], expect: [['[data-res="volt"]', "3.161 V"], ['[data-res="pct"]', "63.21%"]] },
    { name: "4.5 V of 5 V takes ln 10 τ", do: [["set", "#rc-volt", "4.5"]], expect: [["#rc-time", "2.303"]] },
    { name: "100u in a µF field", do: [["set", "#rc-c", "100u"]], expect: [["#rc-c", "100"], ['[data-res="tau"]', "1 s"]] },
    { name: "1m in a µF field is 1000", do: [["set", "#rc-c", "1m"]], expect: [["#rc-c", "1000"], ['[data-res="tau"]', "10 s"]] },
  ],
  "cap-stored-energy": [
    { name: "1000 µF at 12 V", do: [], expect: [['[data-res="solved"]', "72 mJ"], ['[data-res="charge"]', "12 mC"]] },
  ],
  "inductor-color-code": [
    { name: "gold as decimal point: 4.7 µH",
      do: [["click", '.roller-track[data-role="d1"] [data-color="yellow"]'], ["click", '.roller-track[data-role="d2"] [data-color="gold"]'], ["click", '.roller-track[data-role="mult"] [data-color="violet"]']],
      expect: [['[data-res="uh"]', "4.7 µH"]] },
    { name: "only inductor tolerances offered", do: [], expect: [["#ic-tol", "±5%±10%±20%±20%"]] },
  ],
};
