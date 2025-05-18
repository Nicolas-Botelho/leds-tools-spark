import path from "path"
import { LocalEntity, Model } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import { generateCRUD as generateCRUDEntities, generateGet as generateGetEntities } from "./Entities/generate.js"

export function generate(model: Model, listClassCRUD: LocalEntity[], listRefCRUD: LocalEntity[], target_folder: string) : void {

    const basecontrollers_folder = target_folder + "/BaseControllers"
    const entities_folder = target_folder + "/Entities"

    fs.mkdirSync(entities_folder, {recursive: true})
    fs.mkdirSync(basecontrollers_folder, {recursive: true})
    
    generateLoop(model, listClassCRUD, listRefCRUD, entities_folder)
}

function generateLoop(model: Model, listClassCRUD: LocalEntity[], listRefCRUD: LocalEntity[], tgt_folder: string) : void {
    
    for(const cls of listClassCRUD) {
        fs.writeFileSync(path.join(tgt_folder, `${cls.name}Controller.cs`), generateCRUDEntities(model, cls))
    }

    for(const cls of listRefCRUD) {
        fs.writeFileSync(path.join(tgt_folder, `${cls.name}Controller.cs`), generateGetEntities(model, cls))
    }
}