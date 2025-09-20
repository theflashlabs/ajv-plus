import dataFormat from "../../spec/extras/$data/format.json" with {type: "json"}
import dataPattern from "../../spec/extras/$data/pattern.json" with {type: "json"}

export default [
  {name: "$data/format", test: dataFormat},
  {name: "$data/pattern", test: dataPattern},
]
