# Overview

This is a full-stack graffiti tracking application built with React and Express. The application allows users to discover, document, and track graffiti locations on an interactive map. Users can add new graffiti locations with photos, descriptions, and tags, view existing locations with detailed information, and browse all saved locations in a map-based interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Extensive use of Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Map Integration**: Leaflet for interactive mapping functionality
- **File Uploads**: Uppy with dashboard modal for photo upload management

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development Setup**: Custom Vite integration for hot module replacement in development
- **Storage Pattern**: Interface-based storage abstraction (IStorage) with in-memory implementation
- **File Serving**: Custom object storage service with access control capabilities
- **API Design**: RESTful endpoints for CRUD operations on graffiti locations

## Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Object Storage**: Google Cloud Storage integration for photo uploads with ACL-based access control
- **Session Management**: PostgreSQL session store using connect-pg-simple

## Authentication and Authorization
- **Object Access Control**: Custom ACL system with support for different access group types
- **File Access**: Permission-based file serving with public and private object handling
- **Session Storage**: Database-backed session management

## External Dependencies
- **Database**: Neon serverless PostgreSQL for production database hosting
- **Object Storage**: Google Cloud Storage for file uploads and serving
- **Maps**: OpenStreetMap tiles through Leaflet for mapping functionality
- **UI Components**: Radix UI for accessible component primitives
- **File Upload**: Uppy ecosystem for robust file upload handling
- **Development Tools**: Replit-specific integrations for development environment