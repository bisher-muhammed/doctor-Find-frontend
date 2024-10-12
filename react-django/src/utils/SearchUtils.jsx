export const searchItems = (data,searchTearm,keysToSearch)=>{
    if (!searchTearm) return data;

    return data.filter(item=>
        keysToSearch.some(key=>
            String(item[key]).toLowerCase().includes(searchTearm.toLowerCase())
        )
    )
}