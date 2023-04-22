import { Component, OnInit } from '@angular/core';
import { APISService } from '../services/backend.service';
import { HttpErrorResponse } from '@angular/common/http';
import { empty } from 'rxjs';

@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.component.html',
  styleUrls: ['./incidentes.component.css'],
})
export class IncidentesComponent implements OnInit {
  //---- Declaracion de variables

  mostrarFormulario = false; // variable para mostrar dinamicamente el forms
  tipoEnvio!: String;

  // Variables para manipular los datos ingresados en el forms
  id_incidente!: number;
  id_equipo!: number;
  descripcion_incidente!: string;
  fecha_incidente!: string;
  hora_incidente!: string;
  distrito_incidente!: string;

  public incidentes: any = []; // Almacenara la informacion de la tabla incidentes
  busqueda: string = ''; // Almacenara el criterio a filtar en la tabla

  constructor(private incidenteService: APISService) {}
  // Funcion que se ejecutara al cargar la pagina
  ngOnInit() {
    this.cargarIncidentes();
  }

  //--------------------- FUNCIONES

  //--------> Funciones que se usaran en la funcionalidad de la pagina

  // Esta funcion valida que los campos del form esten completas para poder enviar la informacion
  public validarCampos() {
    console.log(this.id_equipo);
    console.log(this.descripcion_incidente);
    console.log(this.fecha_incidente);
    console.log(this.hora_incidente);
    console.log(this.distrito_incidente);
    if (
      !this.id_equipo ||
      !this.descripcion_incidente ||
      !this.fecha_incidente ||
      !this.hora_incidente ||
      !this.distrito_incidente ||
      this.id_equipo == 0
    ) {
      alert('Por favor, complete todos los campos.');
    } else {
      this.guardarIncidentes();
    }
  }

  // Funcion que contiene el envio y muestra de datos del form
  public guardarIncidentes() {
    // Envía los datos a la base de datos
    // if (this.tipoEnvio == 'editar') this.editarData(this.id_personal);
    // else this.enviarData();
    this.enviarData();
    // Se muestra los datos enviados en la consola
    console.log(
      'Datos enviados: ',
      this.id_equipo,
      this.descripcion_incidente,
      this.fecha_incidente,
      this.hora_incidente,
      this.distrito_incidente
    );

    // Oculta el formulario emergente
    this.mostrarFormulario = false;
  }

  // Funcion que al ser llamada limpia los campos del form
  public limpiarIncidentes() {
    this.id_equipo = 0;
    this.descripcion_incidente = '';
    this.fecha_incidente = '';
    this.hora_incidente = '';
    this.distrito_incidente = '';
  }

  // Funcion que es llamada al pulsar el boton cancelar del form
  public cancelar() {
    // Oculta el formulario emergente
    this.mostrarFormulario = false;
  }

  //--------> FUNCIONES DE BUSQUEDA POR FILTROS

  // Funcion que lee el textbox y filtra la informacion
  public filtrarIncidentes() {
    if (this.busqueda === '') {
      this.cargarIncidentes();
    } else {
      this.incidentes = this.incidentes.filter((incidente: any) => {
        const termino = this.busqueda.toLowerCase();
        const descripcion = incidente.descripcion_incidente.toLowerCase();
        const fecha = incidente.fecha_incidente.toLowerCase();
        const hora = incidente.hora_incidente.toLowerCase();
        const distrito = incidente.distrito_incidente.toLowerCase();
        return (
          descripcion.includes(termino) ||
          fecha.includes(termino) ||
          hora.includes(termino) ||
          distrito.includes(termino)
        );
      });
    }
  }
  // Funcion que limpia el textbox y recarga la informacion sin filtrar
  public limpiarBusqueda() {
    this.busqueda = '';
    this.cargarIncidentes();
  }

  //--------> FUNCIONES PARA MANEJAR LAS APIS

  // Funcion para traer la informacion del servidor
  public cargarIncidentes() {
    this.incidenteService.obtenerIncidente().subscribe({
      next: (response) => {
        this.incidentes = response;
        const incidentes = [];
        for (let item of this.incidentes) {
          const dateObject = new Date(item.fecha_incidente);
          let dateFormat = dateObject.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          item.fecha_incidente = dateFormat;
          const timeObject = new Date(item.hora_incidente);
          item.hora_incidente = timeObject.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          incidentes.push(item);
        }
        console.log(incidentes);
        this.incidentes = incidentes;
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
      },
      complete: () => {
        // El método complete() se llama cuando el observable se completa
        console.log('Proceso => Cargar Incidetnes => completo');
      },
    });
  }

  // Funcion que envia data del form al servidor para agregar un nuevo personal
  public enviarData() {
    // Se llama a la variable del servicio y a la funcion correspondiente
    this.incidenteService
      .enviarIncidente({
        // La informacion se envia en formato JSON
        id_equipo: this.id_equipo,
        descripcion_incidente: this.descripcion_incidente,
        fecha_incidente: this.fecha_incidente,
        hora_incidente: this.hora_incidente,
        distrito_incidente: this.distrito_incidente,
      })
      .subscribe({
        next: (response) => {
          // El servidor retorna una respuesta del envio
          console.log('Respuesta recibida');

          // Se limpia la respuesta en status y message
          let respuesta = Object.values(response);
          let status = respuesta.at(1);
          let message = respuesta.at(0);

          // Se muestra en consola la respuesta
          console.log(status, ' => ', message);

          if (status == 'error')
            alert(message); // Se muestra una alerta del error del servidor
          else {
            message =
              'Se agrego exitosamente el incidente : ' +
              this.distrito_incidente +
              ', ' +
              this.fecha_incidente +
              '.';
            alert(message); // Se muestra una alerta de exito
            this.cargarIncidentes(); // Se actualiza la data con los cambios realizados
          }
        },
        error: (error: HttpErrorResponse) => {
          alert(error.message); // Se muestra una alerta del error del servidor
        },
        complete: () => {
          // El método complete() se llama cuando el observable se completa
          console.log('Proceso => Añadir Personal => completo');
        },
      });
  }
}
