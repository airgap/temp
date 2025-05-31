import { encode } from '@msgpack/msgpack';
// const msgpack = require('@msgpack/msgpack');
var myHeaders = new Headers();
myHeaders.append('User-Agent', 'Apidog/1.0.0 (https://apidog.com)');
myHeaders.append('Content-Type', 'application/x-msgpack');
myHeaders.append('Accept', '*/*');
myHeaders.append('Host', 'api.lyku.org');
myHeaders.append('Connection', 'keep-alive');

var file = encode({});

var requestOptions = {
	method: 'POST',
	headers: myHeaders,
	body: file,
	redirect: 'follow',
};

fetch('https://api.lyku.org/list-hot-posts', requestOptions)
	.then((response) => response.text())
	.then((result) => console.log(result))
	.catch((error) => console.log('error', error));
