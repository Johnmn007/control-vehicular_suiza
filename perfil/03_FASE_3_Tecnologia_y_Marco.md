## 6. Marco Teórico y Referencial

El marco teórico de la presente propuesta de innovación se estructura en tres secciones fundamentales, siguiendo los estándares de rigor metodológico y académico para proyectos tecnológicos:

### 6.1 Antecedentes
Investigaciones recientes en sistemas inteligentes de transporte y seguridad patrimonial han demostrado una rápida transición hacia arquitecturas multi-modales. Los modelos tradicionales basados únicamente en tarjetas RFID han sido descartados progresivamente debido a su alta vulnerabilidad frente a clonación y suplantación. Actualmente, la literatura señala que los controles vehiculares más seguros integran un enfoque de "doble o triple capa", combinando el reconocimiento de matrículas con la verificación biométrica del conductor (Sánchez & Ramírez, 2025). Además, estudios enfocados en contextos industriales y rurales advierten sobre las limitaciones que imponen las infraestructuras de red inestables; en este sentido, el desarrollo de aplicaciones optimizadas para baja conectividad ha logrado reducir el consumo de datos y evitar fallas críticas en los controles de acceso (Muppaneni, 2026).

### 6.2 Bases Teóricas
El diseño y funcionamiento de SICISV se sostiene sobre los siguientes postulados tecnológicos:
*   **Inteligencia Artificial y Pérdida de Margen Angular Aditivo (ArcFace):** 
    La validación biométrica del sistema se fundamenta en la arquitectura *ArcFace*, desarrollada originalmente para el reconocimiento facial profundo. Según Deng et al. (2019), esta técnica incorpora un margen angular aditivo que optimiza el límite de decisión de las redes neuronales convolucionales (CNN), obligando al modelo a crear clústeres altamente diferenciados para cada identidad. Esto garantiza que el microservicio de IA (*InsightFace*) del proyecto logre una precisión del estado del arte, minimizando drásticamente los falsos positivos.
*   **Arquitecturas Offline-First y PWA:** 
    Desde la óptica de la ingeniería de software, las Aplicaciones Web Progresivas (PWA) con enfoque *Offline-First* representan un paradigma donde el acceso a la red se considera una mejora progresiva y no una dependencia estricta. El uso de interceptores de red (*Service Workers*) permite almacenar el núcleo de la aplicación (*App Shell*) y emplear bases de datos locales del navegador para garantizar que las transacciones y capturas fotográficas no se pierdan ante caídas de red, sincronizándose en segundo plano (Google Developers, 2025).

### 6.3 Marco Conceptual
*   **Biometría Facial:** Rama de la inteligencia artificial que automatiza el reconocimiento o verificación de la identidad humana basada en rasgos fisiológicos de la cara.
*   **Service Worker:** Secuencia de comandos en segundo plano que permite a las aplicaciones web interceptar peticiones de red y habilitar funciones sin conexión.
*   **Embedding Vectorial:** Representación matemática multidimensional de características extraídas de un dato complejo (como una imagen), permitiendo calcular la similitud (geodésica o euclidiana) entre ellos de manera eficiente.
*   **TRL (Technology Readiness Levels):** Escala de medición usada para evaluar el nivel de madurez de una tecnología particular.

---

## 10. Descripción Técnica y Metodológica

El proyecto SICISV adopta un diseño de investigación tecnológica aplicada, guiado bajo marcos de desarrollo ágil (Scrum) y estructurado bajo una arquitectura de microservicios orientada a eventos.

**Arquitectura y Stack Tecnológico:**
1.  **Frontend (PWA Offline-First):** Construido sobre React 19 y Vite 6. Utiliza APIs nativas del navegador para interactuar con dispositivos periféricos (cámaras) en las garitas de control.
2.  **Backend (API Restful):** Desarrollado en Node.js (Express 5) con tipado estricto en TypeScript. Implementa autenticación asimétrica (JWT) y se acopla al ORM Prisma 7 para la persistencia de datos.
3.  **Capa de Persistencia:** PostgreSQL 18 enriquecido con la extensión vectorial `pgvector`, infraestructura clave para indexar y contrastar eficientemente los *embeddings* matemáticos arrojados por el modelo de visión por computadora.
4.  **Microservicio de Inteligencia Artificial:** Desarrollado en Python (FastAPI). Encapsula el modelo InsightFace, realizando el recorte de rostros (*Face Detection*) y el mapeo biométrico de manera aislada y escalable.

**Roles y Responsabilidades:**
*   **Salas Ormeño, Geric (50%):** Responsable de la capa de presentación (Frontend), diseño UI/UX para operarios y programación de la lógica de sincronización *Offline-First*.
*   **Flores Taricuarima, Ivan (50%):** Responsable de la infraestructura de datos (Backend/PostgreSQL), validación criptográfica y despliegue del microservicio analítico de IA.

*(Nota: En la FASE 4 se abordará el Cronograma detallado y los Resultados Esperados).*

---

## 11. Referencias Bibliográficas

Deng, J., Guo, J., Xue, N., & Zafeiriou, S. (2019). ArcFace: Additive Angular Margin Loss for Deep Face Recognition. En *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)* (pp. 4690-4699). https://doi.org/10.1109/CVPR.2019.00482

Google Developers. (2025). *Progressive Web Apps: Offline First and Service Workers.* Documentación oficial de web.dev. Recuperado de https://web.dev/explore/progressive-web-apps

Muppaneni, V. (2026). Progressive Web Apps: Offline UX Benchmarking and Low-Internet Optimized Architectures. *International Journal of Engineering Trends and Computer Science*, 14(2), 45-56.

Sánchez, M., & Ramírez, J. (2025). Arquitecturas Tri-modales en el Control de Accesos Vehiculares: Integración de Biometría LPR y Face Recognition en Sistemas Inteligentes de Transporte. *Revista Iberoamericana de Sistemas, Cibernética e Informática*, 22(1), 12-21.
