# tagup
To startup:

node server.js

Should print message to terminal.
If hosted in cloud, no setup necessary and it should already be running

APIs:

/api/listList all the records
/api/createCreate a record
/api/read/:recordIdRead a specific record
/api/modify/:recordIdUpdate a specific record
/api/remove/:recordIdDelete a specific record. Can switch out recordId for ‘all’ to clear table

/api/unique/:columnName
counts and retrieves unique columns in given column

/api/status:
Returns number of columns and creation date of db


