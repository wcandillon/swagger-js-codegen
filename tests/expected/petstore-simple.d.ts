interface Petstore {
    findPets(parameters : {
        'tags': Array<string>
        'limit': number
    }): ng.IPromise<Array<pet>>;

    addPet(parameters : {
        'pet': newPet
    }): ng.IPromise<pet>;

    findPetById(parameters : {
        'id': number
    }): ng.IPromise<pet>;

    deletePet(parameters : {
        'id': number
    }): ng.IPromise<any>;

}

// data types
interface pet {
    'id': number
    'name': string
    'tag': string
}

interface newPet {
    'id': number
    'name': string
    'tag': string
}

interface errorModel {
    'code': number
    'message': string
}

