## 4. Justificación

El control de ingresos y salidas de vehículos es un proceso administrativo y de seguridad crítico para cualquier empresa, especialmente en regiones con un creciente dinamismo industrial, logístico y comercial como Ucayali. En la actualidad, muchas organizaciones aún dependen de registros manuales (cuadernos de garita o simples hojas de cálculo) y de la inspección visual humana. Estos métodos tradicionales presentan graves vulnerabilidades: son propensos al error humano, susceptibles a la falsificación de datos, generan cuellos de botella operativos y no pueden evitar eficazmente la suplantación de identidad del conductor.

**Novedad y Pertinencia:** La principal novedad de SICISV radica en la automatización del proceso de control mediante un **flujo estrictamente secuencial** (fotografía del vehículo, fotografía del conductor, y registro de placa) apoyado por Inteligencia Artificial. La validación biométrica mediante *Facial Match* garantiza de forma ineludible que la persona que ingresa o sale es quien dice ser. Asimismo, la arquitectura *Offline-First* (PWA) es sumamente pertinente para el contexto regional, resolviendo el problema crónico de la conectividad inestable en los puestos de vigilancia o garitas industriales.

**Beneficios (Económicos y Sociales):** A nivel económico, el proyecto permite a las empresas reducir mermas y pérdidas por robos sistemáticos al mantener una trazabilidad inmutable y auditable de su patrimonio. A nivel social, dignifica y facilita la labor del personal de vigilancia (ofreciéndoles herramientas digitales ergonómicas y eficientes) y genera entornos laborales mucho más seguros.

**Alineación con los Objetivos de Desarrollo Sostenible (ODS):**
El proyecto se enmarca en el cumplimiento de los siguientes ODS promovidos por la ONU:
*   **ODS 9 (Industria, Innovación e Infraestructura):** SICISV fomenta la modernización tecnológica y la innovación digital aplicada a los procesos operativos e infraestructuras empresariales.
*   **ODS 16 (Paz, Justicia e Instituciones Sólidas):** El sistema reduce las brechas para el fraude corporativo, aportando transparencia, seguridad y trazabilidad total, pilares fundamentales para el desarrollo de instituciones sólidas y confiables.

---

## 5. Objetivos

### 5.1. Objetivo General
Implementar y validar un Sistema Inteligente de Control de Ingresos y Salidas de Vehículos (SICISV) sustentado en validación biométrica facial y arquitectura *offline-first*, con el fin de optimizar la eficiencia, trazabilidad y seguridad en los procesos de control patrimonial empresarial en la región Ucayali.

### 5.2. Objetivos Específicos
1.  **Desarrollar un flujo de registro inmutable y secuencial** que obligue a la captura simultánea de evidencias fotográficas (vehículo y conductor) junto con el registro de placas, eliminando la posibilidad de registros fraudulentos.
2.  **Integrar un microservicio de Inteligencia Artificial** basado en el modelo *InsightFace* para la extracción de *embeddings* faciales y la validación biométrica automática de la identidad del conductor.
3.  **Implementar una arquitectura web progresiva (PWA) con enfoque *Offline-First***, utilizando IndexedDB y *Service Workers*, para asegurar la operatividad ininterrumpida del sistema en garitas con conectividad a internet intermitente o nula.
4.  **Evaluar el rendimiento del sistema** midiendo la precisión de la validación biométrica y la reducción en los tiempos operativos de registro de ingreso y salida en un entorno empresarial de prueba.

---

## 7. Hipótesis

Los controles vehiculares tradicionales en los recintos empresariales e industriales de la región presentan lentitud operativa, alta incidencia de errores de transcripción y son altamente vulnerables a la suplantación de identidad. 

Por lo tanto, se plantea la hipótesis de que **la implementación del sistema SICISV, que combina un flujo de registro fotográfico estrictamente secuencial con validación biométrica facial mediante Inteligencia Artificial, reducirá drásticamente las vulnerabilidades de suplantación de identidad, asegurará una trazabilidad inmutable de las operaciones y optimizará los tiempos de auditoría en los procesos de seguridad patrimonial de las empresas.** De cumplirse esta hipótesis, se demostrará la viabilidad y superioridad técnica de la automatización biométrica frente a los procesos de control manuales.
