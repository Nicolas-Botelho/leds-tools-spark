import path from "path"
import { LocalEntity, Model } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import { generate as generateBaseControllers } from "./BaseControllers/generate.js"
import { generate as generateEntities } from "./Entities/generate.js"

export function generate(model: Model, listClassCRUD: LocalEntity[], target_folder: string) : void {

    const basecontrollers_folder = target_folder + "/BaseControllers"
    const entities_folder = target_folder + "/Entities"

    fs.mkdirSync(entities_folder, {recursive: true})
    fs.mkdirSync(basecontrollers_folder, {recursive: true})
    
    generateBaseControllers(model, basecontrollers_folder)
    generateLoop(model, listClassCRUD, entities_folder)
}

function generateLoop(model: Model, listClassCRUD: LocalEntity[], tgt_folder: string) : void {
    
    for(const cls of listClassCRUD) {
        fs.writeFileSync(path.join(tgt_folder, `${cls.name}Controller.cs`), generateEntities(model, cls))
    }
}