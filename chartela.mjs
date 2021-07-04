import axios from 'axios';
import { JSDOM } from 'jsdom';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let ddtechData = '';
let requestingDdtech = false;
let pcelData = '';
let requestingPcel = false;
let cyberpuertaData = '';
let requestingCyberpuerta = false;
let counter = 0;

async function checkDdtech() {
    if (!requestingDdtech) {
        requestingDdtech = true;
        const response = await axios.get("https://ddtech.mx/productos/componentes/tarjetas-de-video?geforce-rtx-serie-30[]=rtx-3070&stock=con-existencia&orden=primero-existencia&precio=1:99999");
        requestingDdtech = false;
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        let data = '';
        document.querySelectorAll('.product').forEach(element => {
            const name = element.querySelector('.product-info .name a').textContent;
            const price = element.querySelector('.product-info .product-price .price').textContent;
            data += ('\n\n' + name + ' ' + price);
        });
        if (ddtechData.replace(/ /g, '') !== data.replace(/ /g, '')) {
            ddtechData = data;
            console.log(ddtechData);
            await sendEmail(ddtechData, 'ddtech');
        }
    }
}

async function checkPcel() {
    if (!requestingPcel) {
        requestingPcel = true;
        const response = await axios.get('https://pcel.com/hardware/tarjetas-de-video', { headers: { 'cookie': 'display=list; collapse_attribute_5849=true; collapse_attribute_5855=true; collapse_attribute_6895=true; collapse_attribute_5939=true; collapse_price=true; collapse_attribute_5659=true; collapse_attribute_6407=true; collapse_attribute_6415=true; PCELSESS2=kslp3dv3srnoluo3peep4noe8h; display=list; collapse_attribute_5659=true; collapse_attribute_6407=true; collapse_attribute_6415=true; collapse_price=true; language=es; currency=MXN' } });
        requestingPcel = false;
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        let data = '';
        document.querySelectorAll('.product-list table tr').forEach(element => {
            const name = element.querySelector('.name a');
            const price = element.querySelector('.price .price-new');
            if (name && price) {
                data += ('\n' + name.textContent + '\n' + price.textContent);
            }
        });
        if (pcelData !== data) {
            pcelData = data;
            console.log(pcelData);
            await sendEmail(pcelData, 'pcel');
        }
    }
}

async function checkCyberpuerta() {
    if (!requestingCyberpuerta) {
        requestingCyberpuerta = true;
        const response = await axios.get('https://www.cyberpuerta.mx/Computo-Hardware/Componentes/Tarjetas-de-Video/Filtro/Procesador-grafico/NVIDIA-GeForce-RTX-3070/Estatus/En-existencia/');
        requestingCyberpuerta = false;
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        let data = '';

        document.querySelectorAll('#productList .productData').forEach(element => {
            const name = element.querySelector('.emproduct_right_title');
            const price = element.querySelector('.price');
            if (name && price) {
                data += (name.textContent + price.textContent);
            }
        });
        if (cyberpuertaData !== data) {
            cyberpuertaData = data;
            console.log(cyberpuertaData);
            await sendEmail(cyberpuertaData, 'cyberpuerta');
        }
    }
}

async function sendEmail(data, type) {
    counter += 1;
    const msg = {
        to: 'car5009600@gmail.com',
        from: 'car_092@hotmail.com',
        subject: 'Chartela update ' + type + ' ' + counter,
        text: data
    };

    try {
        await sgMail.send(msg);
        console.log('sent')
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
    }
}

setInterval(async () => {
    console.log('<<<<<<<<<< DDTech');
    await checkDdtech();
    console.log('>>>>>>>>>> DDTech');
    console.log('<<<<<<<<<< Pcel');
    await checkPcel();
    console.log('>>>>>>>>>> Pcel');
    console.log('<<<<<<<<<< Cyberpuerta');
    await checkCyberpuerta();
    console.log('>>>>>>>>>> Cyberpuerta');
}, 30000);