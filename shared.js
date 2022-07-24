const STATUS = {
    CLEAR: "Clear",
    TO_SOLVE: "To solve",
    SOLVING: "Solving",
    DONE: "Done"
}

const STATUS_SCHEMA = {
    paperCollID : {
        name: "str",
        papers: {
            paperID: {
                status: "str",
                lastUpd: Date.now(),
                title: "str"
            }
        }
    }
}