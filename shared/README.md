# Código Compartido

Tipos, interfaces y utilidades compartidas entre frontend y backend.

## 📁 Estructura

```
shared/
├── types/
│   ├── user.ts         # Tipos de usuario
│   ├── analysis.ts     # Tipos de análisis
│   └── api.ts          # Tipos de API
├── constants/
│   └── index.ts        # Constantes globales
└── utils/
    └── validation.ts   # Validaciones compartidas
```

## 🎯 Propósito

- **Consistencia:** Mismos tipos en frontend y backend
- **Mantenibilidad:** Un solo lugar para cambios
- **Reutilización:** Evitar duplicación de código
- **Sincronización:** Frontend y backend siempre compatibles