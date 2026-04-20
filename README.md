# Psychoway
Psychoway es una plataforma web que busca acercar a los aprendices del SENA al apoyo psicológico. Mediante un diario de emociones, agenda con videollamadas y un chat con inteligencia artificial, promueve el bienestar mental y reduce el miedo o la pena de acudir a psicología.


```plantuml
@startuml
' Configuración visual
skinparam componentStyle rectangle
left to right direction

actor "Aprendiz\nPsicólogo\nAdministrador" as User

' Definición de la infraestructura
rectangle "Límite de despliegue (Local / Cloud)" {
    
    package "Cliente (Edge)" {
        node "Navegador Web" as BrowserNode {
            component "Frontend (React 19)\nPuerto: 3000" as FE
        }
    }

    package "Servidor / Aplicación" {
        node "Backend API (Node.js)" as BackendNode {
            component "API REST (Express)\nPuerto: 5000" as API
        }
    }

    database "MySQL\n'psychoway'" as DB
}

cloud "Servicio SMTP\n(Proveedor de correo)" as SMTP

' Relaciones principales
User --> FE : Usa (HTTPS)
FE --> API : REST API (JSON)
API --> DB : mysql2 (SQL)
API --> SMTP : Nodemailer (SMTP)

' Notas informativas
note bottom of FE
  - UI: diario, agenda, chat IA
  - Bootstrap & react-router
end note

note bottom of API
  - Lógica: Auth, BCrypt, Objetivos
  - Tokens de recuperación (1h)
end note

note bottom of DB
  - Tablas: users, diary, emotions,
    objetivos, meetings_agenda
end note

' Leyenda
legend left
  |= Componente |= Tecnologías / Rol |
  | Frontend | React, Bootstrap, react-router |
  | Backend | Node.js, Express, bcrypt, nodemailer |
  | DB | MySQL (InnoDB) |
endlegend

@enduml
