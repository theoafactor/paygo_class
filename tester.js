async function whatever(){
    getUser()
    return 1    
}

function getUser(){
    console.log('Welcome James')
}

whatever().then((result) => {
    console.log(result)
})
