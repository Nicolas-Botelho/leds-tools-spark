import { expandToString } from "langium/generate"
import { Attribute, LocalEntity, Model, UseCase, isLocalEntity} from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"
import { RelationInfo} from "../../../../../util/relations.js"

import { generate as generateBaseCase } from "./BaseCase/generate.js"
import { generate as generateGenericService } from "./Services/generate.js"
import { generate as generateGenericDTO } from "./DTOs/generate.js"
import { generate as generateGenericInterface } from "./Interfaces/generate.js"
import { generate as generateGenericUseCase } from "./UseCases/generate.js"

export function generate(model: Model, listClassRefCRUD: LocalEntity[], listUCsNotCRUD: UseCase[], target_folder: string) : void {

    const BaseCase_Folder = target_folder + "/BaseCase"
    fs.mkdirSync(BaseCase_Folder, {recursive: true})
    generateBaseCase(model, BaseCase_Folder)

    let UC_Folder = target_folder
    
    //Gera as pastas para os casos de uso não CRUD
    for(const uc of listUCsNotCRUD) {
        UC_Folder = UC_Folder + `/${uc.name_fragment}Case`
        fs.mkdirSync(UC_Folder, {recursive: true})

        for (const event of uc.events) {
            const Event_Folder = UC_Folder + `/${event.name_fragment}Case`
            fs.mkdirSync(Event_Folder, {recursive: true})

            fs.mkdirSync(Event_Folder + "/Services", {recursive: true})
            fs.mkdirSync(Event_Folder + "/DTOs", {recursive: true})
            fs.mkdirSync(Event_Folder + "/Interfaces", {recursive: true})
            fs.mkdirSync(Event_Folder + "/UseCases", {recursive: true})

            generateGenericService(model, Event_Folder + "/Services", event, uc)
            generateGenericDTO(model, Event_Folder + "/DTOs", event, uc)
            generateGenericInterface(model, Event_Folder + "/Interfaces", event, uc)
            generateGenericUseCase(model, Event_Folder + "/UseCases", event, uc)
        }
    }

}




