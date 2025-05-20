import { Model } from "../../../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model : Model, target_folder : string) : void {
    fs.writeFileSync(path.join(target_folder, "BaseController.cs"), generateBaseController(model))
    fs.writeFileSync(path.join(target_folder, "BaseControllerResult.cs"), generateBaseControllerResult(model))
    fs.writeFileSync(path.join(target_folder, "BaseCrudController.cs"), generateBaseCrudController(model))
    fs.writeFileSync(path.join(target_folder, "BaseGetController.cs"), generateBaseGetController(model))
}

function generateBaseController(model: Model) : string {
    return expandToString`

`
}

function generateBaseControllerResult(model: Model) : string {
    return expandToString`

`
}

function generateBaseCrudController(model: Model) : string {
    return expandToString`

`
}

function generateBaseGetController(model: Model) : string {
    return expandToString`

`
}