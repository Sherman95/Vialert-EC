# Cadena TLS de ECU 911

`ecu911.gob.ec` no entrega el certificado intermedio durante el handshake TLS. Los navegadores suelen recuperarlo mediante AIA, pero OpenSSL/Requests no lo hace automáticamente.

Este directorio contiene el certificado intermedio público indicado por el propio certificado del servidor:

- Sujeto: `Sectigo Public Server Authentication CA DV R36`
- Origen AIA: `http://crt.sectigo.com/SectigoPublicServerAuthenticationCADVR36.crt`
- SHA-256: `8C:54:C3:34:B6:6B:A4:E4:26:77:2A:F4:A3:F9:13:6C:19:A1:AE:C7:29:FD:B2:8C:53:5C:07:A5:A4:EF:22:E0`
- Vigencia: hasta el 21 de marzo de 2036

No se debe reemplazar esta solución por `verify=False`. Si ECU 911 cambia de emisor, hay que verificar y actualizar el certificado desde el nuevo enlace AIA.
