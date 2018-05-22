var account = "encuestasmainbitstorage";
var sas = "?sv=2017-07-29&ss=bfqt&srt=sco&sp=rwdlacup&se=2019-08-01T00:04:16Z&st=2018-05-04T16:04:16Z&spr=https&sig=Mu7zPYYw4ZhYNlh9HaQlyOp5kUqrcyd8PxtkKz4dGLg%3D";
var table = '';
var tableUri = '';

function checkParameters() {
    account 
    sas 

    if (account == null || account.length < 1)
    {
        alert('Please enter a valid storage account name!');
        return false;
    }
    if (sas == null || sas.length < 1)
    {
        alert('Please enter a valid SAS Token!');
        return false;
    }

    return true;
}
    
function getTableService() {
    if (!checkParameters())
        return null;

    tableUri = 'https://' + account + '.table.core.windows.net';
    var tableService = AzureStorage.createTableServiceWithSas(tableUri, sas).withFilter(new AzureStorage.ExponentialRetryPolicyFilter());
    return tableService;
}

function refreshTableList()
{
    var tableService = getTableService();
    if (!tableService)
        return;

    document.getElementById('tables').innerHTML = 'Loading table list...';
    tableService.listTablesSegmented(null, {maxResults : 200}, function(error, results) {
        if (error) {
            alert('List table list error, please open browser console to view detailed error');
            console.log(error);
        } else {
            var output = [];
            output.push('<tr>',
                            '<th>TableName</th>',
                            '<th>Operations</th>',
                        '</tr>');
            if (results.entries.length < 1) {
                output.push('<tr><td>Empty results...</td></tr>');
            }                                    
            for (var i = 0, table; table = results.entries[i]; i++) {
                output.push('<tr>',
                                '<td>', table, '</td>',
                                '<td>', '<button class="btn btn-xs btn-danger" onclick="deleteTable(\'', table ,'\')">Delete</button> ',
                                        '<button class="btn btn-xs btn-success" onclick="viewTable(\'', table ,'\')">Select</button>', '</td>',
                            '</tr>');
            }
            document.getElementById('tables').innerHTML = '<table class="table table-condensed table-bordered">' + output.join('') + '</table>';
        }
    });
}

function viewTable(selectedTable) {
    table = selectedTable;
    // alert('Selected ' + table + ' !');
    refreshEntityList();
}

function refreshEntityList() {
    var tableService = getTableService();
    if (!tableService)
        return;
    
    if (table == null || table.length < 1) {
        alert('Please select a table from table list!')
        return;
    }

    document.getElementById('result').innerHTML = 'Loading table entities...';
    var tableQuery = new AzureStorage.TableQuery().top(1);
    tableService.queryEntities(table, tableQuery, null, function(error, results) {
        if (error) {
            alert('List table entities error, please open browser console to view detailed error');
            console.log(error);
        } else {
            var output = [];
            output.push(`<tr>
                            
                            <th>Tipo</th>
                            <th>Nombre</th>
                            <th>Lugar</th>
                            <th>Fecha</th>
                            <th>Expositor 1</th>
                            <th>Expositor 2</th>
                            
                            
                        </tr>`);
            if (results.entries.length < 1) {
                output.push('<tr><td>Empty results...</td></tr>');
            }
            for (var i = 0, entity; entity = results.entries[i]; i++) {
                var nombre = '';
                var tipo = '';
                var fecha = '';
                var lugar = '';
                var expo1 = '';
                var expo2 = '';
                

                if (typeof entity.Nombre !== 'undefined') {
                    nombre = entity.Nombre._;
                }
                if (typeof entity.Tipo !== 'undefined') {
                    tipo = entity.Tipo._;
                }
                if (typeof entity.Fecha !== 'undefined') {
                    fecha = entity.Fecha._;
                }
                if (typeof entity.Lugar !== 'undefined') {
                    lugar = entity.Lugar._;
                }
                if (typeof entity.Expositor1 !== 'undefined') {
                    expo1 = entity.Expositor1._;
                }
                if (typeof entity.Expositor2 !== 'undefined') {
                    expo2 = entity.Expositor2._;
                }

                output.push('<tr>',
                                
                                '<td>', tipo, '</td>',
                                '<td>', nombre, '</td>',
                                '<td>', lugar, '</td>',
                                '<td>', fecha, '</td>',
                                '<td>', expo1, '</td>',
                                '<td>', expo2, '</td>',
                                
                                
                            '</tr>');
            }
            document.getElementById('result').innerHTML = '<table class="table table-condensed table-bordered">' + output.join('') + '</table>';
        }
    });
}

function addEntity() {
    var tableService = getTableService();
    if (!tableService)
        return;
    
    if (table == null || table.length < 1) {
        alert('Invalid table name!')
        return;
    }

    var party = "0PartitionKey";
    var row = "0RowKey";
    var nombre = document.getElementById('nombre').value;
    var tipo = $('input[name=op-1]:checked').val();
    var fecha = document.getElementById('fecha').value;
    var lugar = document.getElementById('lugar').value;
    var expo1 = document.getElementById('expo1').value;
    var expo2 = document.getElementById('expo2').value;
    var insertEntity = {
        PartitionKey: {'_': party},
        RowKey: {'_': row},
        Nombre: {'_': nombre},
        Tipo: {'_': tipo},
        Fecha: {'_': fecha},
        Lugar: {'_': lugar},
        Expositor1: {'_': expo1},
        Expositor2: {'_': expo2}
    };

    tableService.insertOrMergeEntity(table, insertEntity, function(error, result, response) {
        if(error) {
            alert('Insert table entity error, please open browser console to view detailed error');
            console.log(error);
        } else {
            alert('Insert table entity successfully!');
            refreshEntityList();
        }
    });
}

function deleteEntity(partitionKey, rowKey) {
    var tableService = getTableService();
    if (!tableService)
        return;
    
    if (table == null || table.length < 1) {
        alert('Invalid table name!')
        return;
    }

    var deleteEntity = {
        PartitionKey: {'_': partitionKey},
        RowKey: {'_': rowKey}
    };

    tableService.deleteEntity(table, deleteEntity, function(error, result, response) {
        if(error) {
            alert('Delete table entity error, please open browser console to view detailed error');
            console.log(error);
        } else {
            alert('Delete table entity successfully!');
            refreshEntityList();
        }
    });
};
$(document).ready(function () {
    refreshTableList();
    viewTable('encuestasrh');//leer tabla
});
