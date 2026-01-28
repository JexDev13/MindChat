# Appointment Service - Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["services/servicio-citas/servicio-citas.csproj", "services/servicio-citas/"]
RUN dotnet restore "services/servicio-citas/servicio-citas.csproj"

# Copy everything else and build
COPY services/servicio-citas/ services/servicio-citas/
WORKDIR "/src/services/servicio-citas"
RUN dotnet build "servicio-citas.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "servicio-citas.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "servicio-citas.dll"]
