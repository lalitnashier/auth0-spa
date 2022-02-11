# Demo SPA

The purpose of this demo app is to demonstrate working of the Auth0 RBAC with Single Page Application.

Setup your tenant, APIs, app, scopes, permissions, roles on Auth0 Dashboard.

## Setup SSL for Localhost

Auth0 requires secure (https) callback endpoints. Localhost is inherently insecure, so while testing on localhost we can deploy self-signed crt in order to make local testing easy.

Make sure you're at root of this project when running following commands:

```bash
mkdir -p cert/CA/localhost
cd cert/CA
```

### Generate a CA certificate

No one owns localhost - No Certificate Authority issued certificate. Let's sign our sign the certificate.

Let's generate a private key. Keep it simple, provide easy to remember passphrase (e.g. test1) when prompted.

```bash
openssl genrsa -out CA.key -des3 2048
```

Now generate a root CA certificate using the key we just generated above. You'll be asked to enter the passphrase and other details. You can keep them sudo-real.

- Country Name (2 letter code) []:US
- State or Province Name (full name) []:California
- Locality Name (eg, city) []:San Francisco
- Organization Name (eg, company) []:Local
- Organizational Unit Name (eg, section) []:Software
- Common Name (eg, fully qualified host name) []:localhost
- Email Address []:test@test.com

```bash
openssl req -x509 -sha256 -new -nodes -days 3650 -key CA.key -out CA.pem
```
Check if you've two files: CA.key and CA.pem

### Generating a certificate

With CA key and CA certificate, it is possible to sign our own SSL certificates.

```bash
cd localhost
touch localhost.ext
```

`localhost.ext` will contain the information that needs to be written into the signed SSL certificate.

```
authorityKeyIdentifier = keyid,issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
```

With above information the certificate will work for localhost and also for 127.0.0.1.

For my local setup I used the following and modified `/etc/hosts` accordingly.

```
authorityKeyIdentifier = keyid,issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1

DNS.2 = myapp.example
IP.2 = 127.0.0.1
```

Now generate a key and use the key to generate a CSR (Certificate Signing Request).

First generate the localhost private key. You'll be asked to provide a passphrase. I suggest provide easy to remember passphrase (e.g. test1). I kept it same as previous.

```bash
openssl genrsa -out localhost.key -des3 2048
```

We'll generate CSR using the key. You'll be asked to enter the passphrase and other details. You can keep them sudo-real.

- Country Name (2 letter code) []:US
- State or Province Name (full name) []:California
- Locality Name (eg, city) []:San Francisco
- Organization Name (eg, company) []:Local
- Organizational Unit Name (eg, section) []:Software
- Common Name (eg, fully qualified host name) []:localhost
- Email Address []:test@test.com
- A challenge password []:<I kept it same as passphrase, easy to remember>

```bash
openssl req -new -key localhost.key -out localhost.csr
```

With this CSR, we'll request the CA to sign a certificate. The following command will generate `localhost.crt`.

```bash
openssl x509 -req -in localhost.csr -CA ../CA.pem -CAkey ../CA.key -CAcreateserial -days 3650 -sha256 -extfile localhost.ext -out localhost.crt
```

Finally, our server will need the `localhost.crt` certificate file, and the decrypted key since our `localhost.key` is in encrypted form.

Let's decrypt the `localhost.key` and store that file too:

```bash
openssl rsa -in localhost.key -out localhost.decrypted.key
```

Our server (`server.js`) is already configured to look for `localhost.decrypted.key` and `localhost.crt` at `cert/CA/localhost`

## Running the Application

### Specifying Auth0 Credentials

Specify the application client ID and domain in `auth_config.json`:

```json
{
  "domain": "my-test1.us.auth0.com",
  "clientId": "YOUR_CLIENT_ID"
}
```

### Installation

```bash
npm ci
```

This will install all the necessary packages in order for the app to run.

### Running the Application

This version of the application uses an [Express](https://expressjs.com) server that can serve the site from a single page. To start the app from the terminal, run:

```bash
npm run dev
```

You could now access server on `https://localhost:3000` or `https://myapp.example:3000` if you chose a different domain name.