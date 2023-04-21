from flask import Flask,Response, jsonify, request
from flask_mysqldb import MySQL
from datetime import datetime,timedelta
import MySQLdb.cursors
import json
from flask_cors import CORS


app = Flask(__name__)

# Configuración de la conexión a la base de datos
app.config['MYSQL_HOST'] = '54.159.97.219'
app.config['MYSQL_USER'] = 'support'
app.config['MYSQL_PASSWORD'] = 'sistemas20.'
app.config['MYSQL_DB'] = 'emerginet'

mysql = MySQL(app)

# enable CORS

CORS(app, resources={r'/*': {'origins': '*'}})

@app.route('/')
def init():
    return "DataBase Data"

## APIS para enviar las tablas

@app.route('/personal')
def obtener_usuarios():
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("SELECT * FROM personal")
        personalList = cursor.fetchall()
        data = []
        for row in personalList:
            d = {'id_personal': row[0], 'nombre': row[1], 'apellido-pat': row[2], 'apellido-mat': row[3], 'tipo': row[4]}
            data.append(d)
        return Response(json.dumps(data, separators=(',', ':')), mimetype='application/json')
    except Exception as e:
        print(e)
    finally:
        cursor.close()

@app.route('/equipo')
def obtener_equipos():
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("SELECT * FROM equipo")
        equipoList = cursor.fetchall()
        data = []
        for row in equipoList:
            d = {'id_equipo': row[0], 'id_conductor': row[1], 'id_paramedico1': row[2], 'id_paramedico2': row[3], 'placa_vehiculo': row[4]}
            data.append(d)
        return Response(json.dumps(data, separators=(',', ':')), mimetype='application/json')
    except Exception as e:
        print(e)
    finally:
        cursor.close()

@app.route('/incidente')
def obtener_incidentes():
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("SELECT * FROM incidente")
        incidenteList = cursor.fetchall()
        data = []
        for row in incidenteList:
            fecha_incidente = row[3]
            hora_incidente = datetime.min + row[4]
            d = {
                'id_incidente': row[0],
                'id_equipo': row[1],
                'descripcion_incidente': row[2],
                'fecha_incidente': fecha_incidente.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
                'hora_incidente': hora_incidente.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
                'distrito_incidente': row[5]
            }
            data.append(d)
        datos_formateados = [{k: v.strftime('%Y-%m-%d %H:%M:%S') if isinstance(v, datetime) else v for k, v in d.items()} for d in data]
        response = Response(json.dumps(datos_formateados, separators=(',', ':')), mimetype='application/json')
        return response
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        

## API PARA INSERTAR
@app.route('/insert_personal',methods=['GET','POST'])
def insert_personal():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        response_object = {'status': 'success'}
        print("aver")
        if request.method == 'POST':
            post_data = request.get_json(silent=True)
            print(post_data)
            nombre_personal=post_data.get('nombre_personal')
            apellido_pat=post_data.get('apellido_pat')
            apellido_mat=post_data.get('apellido_mat')
            Tipo_Personal=post_data.get('tipo')

            print(nombre_personal)
            print(apellido_pat)
            print(apellido_mat)
            print(Tipo_Personal)

            sql = "INSERT INTO personal(nombre_personal, apellido_pat, apellido_mat, Tipo_Personal) VALUE(%s, %s, %s, %s)"
            data = (nombre_personal, apellido_pat, apellido_mat, Tipo_Personal)
            cursor = mysql.connection.cursor()
            cursor.execute(sql, data)
            mysql.connection.commit() 

            response_object['message']="Successfully Added"
            return jsonify(response_object)
    except Exception as e:
            response_object = {'status': 'error'}
            response_object['message'] = f"Error al insertar el personal: {e}"
            print(response_object)
            return jsonify(response_object)

## API PARA ELIMINAR
@app.route('/delete_personal', methods=['GET', 'POST'])
def delete_personal():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        response_object = {'status': 'success'}
        post_data = request.get_json(silent=True)
        id = post_data.get('id_personal')
        id = str(id)
        sql = "DELETE FROM personal WHERE id_personal = %s"
        cursor = mysql.connection.cursor()
        cursor.execute(sql, (id,))
        mysql.connection.commit() 
        response_object['message'] = "Successfully Eliminated"
        print(response_object)
        return jsonify(response_object)
    except Exception as e:
        response_object = {'status': 'error'}
        response_object['message'] = f"Error al eliminar el personal: {e}"
        print(response_object)
        return jsonify(response_object)

## API PARA EDITAR
# TODO
@app.route('/edit_personal',methods=['GET','POST'])
def edit_personal():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    response_object = {'status': 'success'}
    post_data = request.get_json(silent=True)
    id = post_data.get('id_personal')
    id = str(id)
    #sql = "DELETE FROM personal WHERE id_personal = %s"
    cursor = mysql.connection.cursor()
    cursor.execute(sql, (id,))
    mysql.connection.commit() 
    response_object['message']="Successfully Eliminated"
    return jsonify(response_object)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)