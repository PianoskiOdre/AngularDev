import * as signalR from '@microsoft/signalr';

export class RealtimeService {
  private hubConnection!: signalR.HubConnection;

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7081/dashboardHub', {
        withCredentials: true
      })
      .build();

    this.hubConnection.start()
      .catch(err => console.error(err));
  }

  onVenda(callback: (data: any) => void) {
    this.hubConnection.on('VendaRealizada', callback);
  }
}