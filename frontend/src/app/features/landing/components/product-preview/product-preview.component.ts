import { Component } from '@angular/core';

@Component({
  selector: 'app-product-preview',
  standalone: true,
  template: `
    <!-- Main Content -->
    <div class="flex-grow bg-white/5 rounded-lg p-4 flex flex-col gap-4 w-full">
      <!-- Título -->
      <div class="h-8 w-1/2 bg-landing-primary/20 rounded-lg flex items-center justify-center text-white text-sm font-bold">
        Panel de Control
      </div>
      
      <!-- Contenido principal -->
      <div class="flex-grow grid grid-cols-3 gap-4">
        <div class="col-span-2 bg-white/5 rounded-lg p-2 flex flex-col gap-2">
          <div class="h-4 w-full bg-landing-primary/20 rounded-full flex items-center justify-center text-white text-xs">
            Alertas recientes
          </div>
          <div class="h-4 w-2/3 bg-white/10 rounded-full flex items-center justify-center text-white/70 text-xs">
            Fatiga detectada
          </div>
          <div class="h-4 w-3/4 bg-white/10 rounded-full flex items-center justify-center text-white/70 text-xs">
            Distracción detectada
          </div>
        </div>
        <div class="bg-gradient-to-br from-landing-primary/30 to-purple-500/20 rounded-lg flex items-center justify-center">
          <div class="text-center">
            <div class="text-2xl">🚗</div>
            <div class="text-xs text-white/80 mt-1">Vehículo #001</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductPreviewComponent {
}