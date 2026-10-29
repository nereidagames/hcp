setupJoystick() {
      // Pobieranie dedykowanej strefy w kreatorze światów
      const zone = document.getElementById('build-joystick-zone') || document.getElementById('joystick-zone');
      if (!zone) return;

      if (this.joystick) {
          this.joystick.destroy();
          this.joystick = null;
      }

      // Duży, wygodny joystick w lewym dolnym rogu
      this.joystick = new VirtualJoystick(zone, {
          maxRadius: 48,
          fixed: true,
          onMove: (vector) => {
              this.joystickData.x = vector.x;
              this.joystickData.y = vector.y;
          },
          onEnd: () => {
              this.joystickData.x = 0;
              this.joystickData.y = 0;
          }
      });
  }