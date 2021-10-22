import { REGEX_HOLDER } from "./Constants";

function validateFields(currUser , currErr){
    for(const [field , regexList] of Object.entries(REGEX_HOLDER)){
        var errorList = '';
        regexList.forEach(regex => {
            for(var key in regex){
                let curr_key = key;
                let curr_value = regex[key];
                let re = new RegExp(curr_key)
                if(!re.test(currUser[field])){
                    errorList = errorList + curr_value + '\n';
                }
            }
        })
        if((field == 'pass' || field == 'rePass') && (currUser.pass !== currUser.rePass)){
            errorList += '-Passwords should match!\n';
        }
        currErr[field] = errorList;
    }
}

export function registerPerson(nick , firstName , lastName , pass , rePass , email , setInvalidRegister){
    const currUser = {nick : nick , firstName : firstName , lastName : lastName , pass : pass , rePass : rePass , email : email};
    var currErr = {nick : '#' , firstName : '#' , lastName : '#' , pass : '#' , rePass : '#' , email : '#'};
    validateFields(currUser , currErr);
    setInvalidRegister(currErr);
}