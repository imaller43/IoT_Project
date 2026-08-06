const axios = require('axios');

async function checkCors() {
    try {
        const res = await axios.options('https://influx.ikmaliman.my/api/v2/query?org=Project%20IoT%20Sapura', {
            headers: {
                'Origin': 'https://comfy-faloodeh-b6b224.netlify.app',
                'Access-Control-Request-Method': 'POST'
            }
        });
        console.log('Status:', res.status);
        console.log('Headers:', res.headers);
    } catch (e) {
        console.log('Error:', e.message);
        if (e.response) {
            console.log('Error Status:', e.response.status);
            console.log('Error Headers:', e.response.headers);
        }
    }
}

checkCors();
