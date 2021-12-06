const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Process Stripe Payments =>/api/v1/payment/process
exports.processPayment=async(req,res,next)=>{
    let paymentIntent;
   let amount = Number(req.body.amount)*100;
    try {
         paymentIntent = await stripe.paymentIntents.create({
            amount:amount,
            currency:'INR',
    
            metadata:{integration_check:"accept_a_payment"}
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({message:"Something happened in Stripe"})
    }
 
    res.status(200).json({
        success:true,
        client_secret:paymentIntent.client_secret,
    })
}

// Send Stripe Api key =>/api/v1/stripeapi
exports.sendStripeApi=async(req,res,next)=>{
   


    res.status(200).json({
       stripeApiKey:process.env.STRIPE_API_KEY
    })
}