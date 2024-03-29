import initStripe from 'stripe';
import { getServiceSupabase } from '../../utils/supabase';

const handler = async (req, res) => {
    if(req.query.API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
        return res.status(401).send('HENRY PEPPERS SAYS YOU ARE NOT ALLOWED!!!!!!!')
    }

    // Stripe client
    const stripe = initStripe(process.env.STRIPE_SECRET_KEY)

    const customer = await stripe.customers.create({
        email: req.body.record.email
    });

    // Bypass RLS by using service supabase client instead of the regular client
    const supabase = getServiceSupabase();

    await supabase
        .from('profile')
        .update({
            stripe_customer: customer.id,
        })
        .eq("id", req.body.record.id);

    res.send({message: `stripe customer created: ${customer.id}`});
};

export default handler;