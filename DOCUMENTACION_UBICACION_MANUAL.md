# Documentación: Implementación de Ubicación Manual en el Mapa

## 📋 Resumen General

Se ha implementado un sistema que permite a los usuarios especificar su ubicación en el mapa de la Universidad Nacional de Colombia de **dos formas diferentes**:

1. **Clic directo en el mapa**: El usuario hace clic sobre cualquier punto del mapa para establecer su ubicación.
2. **Entrada manual de coordenadas**: El usuario introduce latitud y longitud en los campos de texto y presiona "Ir".

Esta ubicación se guarda en el estado global (Redux) y está disponible para otros componentes como `EventForm` y `RoutingPanel`.

**Nota importante**: Los objetos de Mapbox (como marcadores) **no se almacenan en Redux** porque no son serializables. Se mantienen como referencias locales en memoria.

---

## 🔧 Paso 1: Extensión del Estado Global (Redux)

### Archivo: `frontend/src/features/map/mapSlice.ts`

Se añadió un nuevo campo al estado del mapa para almacenar la ubicación del usuario:

```typescript
interface MapState {
  mapInstance: any;
  isLoaded: boolean;
  mode: "2D" | "3D";
  selectedPOI: Omit<POI, "marker"> | null;  // ← Sin marcador (no serializable)
  selectedBuilding: Building | null;
  pois: Omit<POI, "marker">[];             // ← Sin marcadores
  buildings: Building[];
  userLocation: { lat: number; lng: number } | null;  // ← NUEVO
}

const initialState: MapState = {
  mapInstance: null,
  isLoaded: false,
  mode: "2D",
  selectedPOI: null,
  selectedBuilding: null,
  pois: [],
  buildings: [],
  userLocation: null,  // ← NUEVO
};
```

**⚠️ Nota importante sobre `Omit<POI, "marker">`:**

Los objetos de Mapbox (como `mapboxgl.Marker`) **no son serializables** y no pueden almacenarse en Redux. Por eso se usa `Omit<POI, "marker">` para excluir este campo. Los marcadores se mantienen en una estructura local (un `Map`) en `useMap.ts` en lugar de en el estado Redux.

**Nueva acción Redux:**

```typescript
const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setUserLocation: (
      state,
      action: PayloadAction<{ lat: number; lng: number } | null>
    ) => {
      state.userLocation = action.payload;
    },
    // ... otras acciones
  },
});

export const { ..., setUserLocation } = mapSlice.actions;
```

**Propósito**: Centralizar la información de la ubicación seleccionada para que cualquier componente pueda acceder a ella mediante Redux.

---

## 🗺️ Paso 2: Captura de Clics y Marcador Visual

### Archivo: `frontend/src/features/map/MapView.tsx`

#### Imports añadidos:

```typescript
import { useDispatch, useSelector } from "react-redux";
import { setUserLocation } from "./mapSlice";
import type { RootState } from "../../app/store";
```

#### Estado y referencias:

```typescript
export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);  // ← NUEVO
  const [is3D, setIs3D] = useState(false);
  const { setMapInstance } = useMap();
  const dispatch = useDispatch();  // ← NUEVO
```

#### Escucha de clics en el mapa:

Dentro del `useEffect` que inicializa el mapa, se agregó un listener para capturar clics:

```typescript
map.current.on("click", (e) => {
  const { lng, lat } = e.lngLat;
  dispatch(setUserLocation({ lat, lng }));  // Guardar en Redux

  // Crear o actualizar marcador visual
  if (userMarker.current) {
    userMarker.current.setLngLat([lng, lat]);
  } else {
    const el = document.createElement("div");
    el.style.width = "20px";
    el.style.height = "20px";
    el.style.backgroundColor = "#FF0000";
    el.style.borderRadius = "50%";
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 0 8px rgba(255,0,0,0.5)";

    userMarker.current = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current!);
  }
});
```

**Comportamiento**:
- Cuando el usuario hace clic en el mapa, se extrae la latitud y longitud.
- Se despacha la acción `setUserLocation` para guardar en Redux.
- Se crea o actualiza un marcador visual (círculo rojo) en esa posición.
- Si hay un marcador anterior, se mueve a la nueva posición.

#### Actualización del dependency array:

```typescript
}, [setMapInstance, dispatch]);  // ← Se añadió 'dispatch'
```

---

## 📍 Paso 3: Controles de Coordenadas Manuales

### Archivo: `frontend/src/features/map/MapControls.tsx`

#### Imports añadidos:

```typescript
import { useDispatch } from "react-redux";
import { setUserLocation } from "./mapSlice";
```

#### Destructuración de hooks:

```typescript
const { getMapInstance, setMapMode, flyToLocation } = useMap();  // ← Se añadió 'flyToLocation'
const dispatch = useDispatch();  // ← NUEVO
const [lat, setLat] = useState("");  // ← NUEVO
const [lng, setLng] = useState("");  // ← NUEVO
```

#### Función `goToCoords`:

```typescript
const goToCoords = () => {
  const nlat = parseFloat(lat);
  const nlng = parseFloat(lng);
  if (!isNaN(nlat) && !isNaN(nlng)) {
    flyToLocation(nlat, nlng);  // Volar a esas coordenadas
    dispatch(setUserLocation({ lat: nlat, lng: nlng }));  // Guardar en Redux
    setLat("");  // Limpiar inputs
    setLng("");
  }
};
```

**Propósito**: Permitir que el usuario navegue a coordenadas específicas sin necesidad de hacer clic.

#### Controles en el JSX:

Se añadió un bloque visual con:
- **Label**: "Ir a coordenadas"
- **Input Latitud**: Campo numérico para ingresar latitud
- **Input Longitud**: Campo numérico para ingresar longitud
- **Botón Ir**: Se activa solo cuando ambos campos están rellenos

```jsx
<div style={{ display: "flex", flexDirection: "column", gap: "8px", ... }}>
  <label>Ir a coordenadas</label>
  <input
    type="number"
    placeholder="Latitud"
    value={lat}
    onChange={(e) => setLat(e.target.value)}
    step="0.0001"
  />
  <input
    type="number"
    placeholder="Longitud"
    value={lng}
    onChange={(e) => setLng(e.target.value)}
    step="0.0001"
  />
  <button
    onClick={goToCoords}
    disabled={!lat || !lng}
  >
    Ir
  </button>
</div>
```

---

## 🎯 Manejo Local de Marcadores (Detalle Técnico)

### Archivo: `frontend/src/hooks/useMap.ts`

Aunque los datos de los POIs se guardan en Redux sin los marcadores, las referencias a los objetos de Mapbox se mantienen localmente en una estructura `Map`:

```typescript
const poiMarkers = new Map<string, mapboxgl.Marker>();  // Almacenamiento local

const addPOIToMap = (poi: POI) => {
  // ... crear el marcador ...
  
  // Guardar la referencia a nivel local (NO en Redux)
  poiMarkers.set(poi.id, marker);
  
  // Guardar solo los datos serializables en Redux
  const { marker: _, ...poiWithoutMarker } = poi;
  dispatch(addPOI(poiWithoutMarker));
};

const removePOIFromMap = (poiId: string) => {
  // Acceder al marcador desde la estructura local
  const marker = poiMarkers.get(poiId);
  if (marker) {
    marker.remove();  // Remover del mapa
    poiMarkers.delete(poiId);  // Limpiar referencias
  }
  dispatch(removePOI(poiId));  // Remover de Redux
};
```

**¿Por qué esto?** Redux y Immer (que usa internamente) requieren que todos los objetos sean serializables (convertibles a JSON). Los objetos de Mapbox tienen referencias cíclicas y métodos que no pueden serializarse, por eso se mantienen fuera de Redux.

---

## 🔄 Flujo Completo de Datos

```
┌─────────────────────────────────────────────────────┐
│         USUARIO INTERACTÚA CON EL MAPA              │
└────────────┬──────────────────────────────┬──────────┘
             │                              │
    ┌────────▼─────────┐          ┌────────▼──────────┐
    │  OPCIÓN 1:       │          │  OPCIÓN 2:        │
    │  CLIC EN MAPA    │          │  COORDENADAS      │
    │                  │          │  MANUALES         │
    └────────┬─────────┘          └────────┬──────────┘
             │                              │
             │ MapView.tsx                  │ MapControls.tsx
             │ map.on("click")              │ goToCoords()
             │                              │
    ┌────────▼──────────────────────────────▼──────────┐
    │  DESPACHAR ACTION:                                │
    │  dispatch(setUserLocation({ lat, lng }))         │
    └────────┬─────────────────────────────────────────┘
             │
    ┌────────▼─────────────────────────────────────────┐
    │  ACTUALIZAR REDUX STATE:                          │
    │  state.map.userLocation = { lat, lng }           │
    └────────┬─────────────────────────────────────────┘
             │
    ┌────────▼──────────────────────────────┐
    │  DISPONIBLE PARA OTROS COMPONENTES:   │
    │  - EventForm                          │
    │  - RoutingPanel                       │
    │  - Cualquier componente que use Redux │
    └───────────────────────────────────────┘
```

---

## 💡 Ejemplo de Uso en Otros Componentes

### En `EventForm.tsx`:

```typescript
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

export default function EventForm() {
  const userLocation = useSelector((s: RootState) => s.map.userLocation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input: EventInput = {
      title,
      description,
      organizer,
      category,
      startDate,
      endDate,
      // Usar ubicación del usuario si está disponible
      coordinates: userLocation ?? {
        lng: -74.08175,
        lat: 4.6351,
      },
    };

    await eventService.createEvent(input);
  };

  // ... resto del componente
}
```

### En `RoutingPanel.tsx`:

```typescript
const userLocation = useSelector((s: RootState) => s.map.userLocation);

// Al hacer clic en el botón "Usar mi ubicación" como origen
const useAsOrigin = () => {
  if (userLocation) {
    setOrigin(userLocation);
  }
};
```

---

## 🎨 Características Visuales

### Marcador de Usuario:
- **Color**: Rojo (#FF0000)
- **Tamaño**: 20px × 20px
- **Borde**: 3px blanco
- **Sombra**: Efecto de brillo azulado

### Controles de Coordenadas:
- **Posición**: Esquina superior derecha (junto a botones 2D/3D)
- **Fondo**: Blanco
- **Estilo**: Con sombra suave para destacar
- **Input**: Aceptan números decimales con precisión de 4 decimales

---

## ✅ Validaciones

1. **Clics en el mapa**: No hay validaciones especiales, cualquier clic es válido.
2. **Coordenadas manuales**:
   - Ambos campos deben estar rellenos
   - Deben ser números válidos
   - El botón "Ir" se deshabilita si faltan valores

---

## 🔍 Debugging

Si algo no funciona, revisa:

1. **¿El token de Mapbox está configurado?**
   - `.env` en la carpeta `frontend/` con `VITE_MAPBOX_TOKEN=...`

2. **¿Los imports están correctos?**
   - `useDispatch` y `useSelector` de `react-redux`
   - `setUserLocation` de `mapSlice`

3. **¿Redux devtools está activo?**
   - Abre Redux DevTools para ver el estado actual
   - Verifica que `map.userLocation` se actualiza al hacer clic
   - **Nota**: No verás los marcadores en Redux (están en memoria local), solo verás `pois` sin campo `marker`

4. **¿El marcador de usuario aparece?**
   - Abre la consola del navegador (F12)
   - Busca errores de `mapboxgl.Marker`
   - Verifica que la referencia `userMarker.current` no es nula

5. **¿Los POIs se visualizan correctamente?**
   - Redux contiene `pois` sin los marcadores (eso es normal y esperado)
   - Los marcadores están en memoria local en `poiMarkers` de `useMap.ts`
   - Si necesitas remover un POI, asegúrate que el ID existe en ambas estructuras

---

## 📦 Resumen de Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `mapSlice.ts` | Agregó campo `userLocation` y acción `setUserLocation`. Usa `Omit<POI, "marker">` para excluir marcadores no-serializables |
| `MapView.tsx` | Agregó listeners de clic y lógica de marcadores de usuario (`userMarker.current`) |
| `MapControls.tsx` | Agregó controles de entrada manual de coordenadas |
| `useMap.ts` | Agregó `poiMarkers` (Map local) para gestionar referencias a marcadores sin guardarlos en Redux |

---

## 🚀 Próximas Mejoras Posibles

1. **Geocodificación**: Convertir direcciones (texto) en coordenadas automáticamente.
2. **Historial de ubicaciones**: Guardar las últimas ubicaciones visitadas.
3. **Búsqueda de poi**: Permitir filtrar por tipo (cafetería, biblioteca, etc.).
4. **Marcadores múltiples**: Permitir varios marcadores simultáneamente.
5. **Exportar ubicación**: Copiar coordenadas al portapapeles con un clic.

---

**Fecha de implementación**: Marzo 10, 2026  
**Última actualización**: Marzo 10, 2026 (incluye refactorización de serialización Redux)
