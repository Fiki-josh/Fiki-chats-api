
const dbErrorHandler = (err,_req,res) => {
    if(err.name === 'ValidationError'){
        // extract error message from objectFit: 
        const errorMessage = Object.values(err.errors).map((error) => error.message);

        return res.status(400).json({errorMessage});
    }

    return res.status(500).json({message: "Something went wrong please again later"});
};

export default dbErrorHandler;
