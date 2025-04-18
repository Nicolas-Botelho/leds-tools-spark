import { LocalEntity, Model } from "../../../../../language/generated/ast.js"
import fs from "fs"
import { generate as projectGenerator } from "./project-generator.js"
import { generate as sharedGenerator } from "./Shared/generate.js"
import { generate as servicesGenerator } from "./Services/generate.js"
import { generate as DTOGenerator } from "./DTOs/generate.js"
import { generate as InterfacesGenerator } from "./Interfaces/generate.js"
import { generate as MappersGenerator } from "./Mappers/generate.js"
import { generate as ConfigurationGenerator } from "./Configuration/generate.js"
import { generate as SecurityGenerator } from "./Security/generate.js"
import { generate as UseCaseGenerator } from "./UseCase/generate.js"

export function generate(model: Model, listClassCRUD: LocalEntity[], target_folder: string) : void {
    
    const Shared_folder = target_folder + "/Shared"
    const Services_Folder = target_folder + "/Services"
    const DTOs_Folder = target_folder + "/DTOs"
    const Interfaces_Folder = target_folder + "/Interfaces"
    const Mappers_Folder = target_folder + "/Mappers"
    const Configuration_Folder = target_folder + "/Configuration"
    const Security_Folder = target_folder + "/Security"
    const UseCases_Folder = target_folder + "/UseCase"

    fs.mkdirSync(Shared_folder, {recursive: true})
    fs.mkdirSync(Services_Folder, {recursive: true})
    fs.mkdirSync(DTOs_Folder, {recursive: true})
    fs.mkdirSync(Interfaces_Folder, {recursive: true})
    fs.mkdirSync(Mappers_Folder, {recursive: true})
    fs.mkdirSync(Configuration_Folder, {recursive: true})
    fs.mkdirSync(Security_Folder, {recursive: true})
    fs.mkdirSync(UseCases_Folder, {recursive: true})

    projectGenerator(model, target_folder)
    sharedGenerator(model, Shared_folder)   
    servicesGenerator(model, listClassCRUD, Services_Folder)
    DTOGenerator(model, listClassCRUD, DTOs_Folder)
    InterfacesGenerator(model, listClassCRUD, Interfaces_Folder)
    MappersGenerator(model, listClassCRUD, Mappers_Folder)
    ConfigurationGenerator(model, listClassCRUD, Configuration_Folder)
    SecurityGenerator(model, Security_Folder)
    UseCaseGenerator(model, listClassCRUD, UseCases_Folder)

}