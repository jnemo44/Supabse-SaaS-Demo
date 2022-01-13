import initStripe from 'stripe';

const handler = async (req, res) => {
    const stripe = initStripe(process.env.STRIPE_SECRET_KEY)

    const customer = await stripe.customers.create({
        email: req.body.record.email
    });

    res.send({message: 'stripe customer created: ${customer.id}'});
};

export default handler;