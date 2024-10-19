const Product = require("../models/Product");


const SearchBus = async (req, res) => {

    try {
        const { inTime, outTime, form, to, date } = req.body;


        console.log(date);

        const searchBus = await Product.find({
            date,
            inTime: { $gte: inTime, $lte: outTime },
            outTime: { $gte: outTime },
            form,
            to,
        });

        console.log(searchBus);



        if (searchBus.length > 0) {
            return res.status(200).send(searchBus);
        }else{
            return res.status(404).send({ message: 'No buses found for the specified date' });
        }

        return res.status(404).send({ message: 'No buses found for the specified time' });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

module.exports = { SearchBus };