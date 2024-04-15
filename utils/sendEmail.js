import {createTransport} from 'nodemailer'
const sendEmail = async (to,subject,message) =>{
    try{
    let transport = createTransport({
        service:'gmail',
        auth:{
            user:'avivsalem95@gmail.com',
            pass:'nobl blay tsjy xmoh',
            
        }
    });
    await transport.sendMail({
        from:'avivsalem95@gmail.com',
        to,
        subject,
        html:message,
    })
    return true;
}
    catch(error){
        console.log(error);
        return false;
}
}
export default sendEmail;