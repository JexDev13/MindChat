# Clinical Service - Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["services/clinical-service/clinical-service.csproj", "services/clinical-service/"]
RUN dotnet restore "services/clinical-service/clinical-service.csproj"

# Copy everything else and build
COPY services/clinical-service/ services/clinical-service/
WORKDIR "/src/services/clinical-service"
RUN dotnet build "clinical-service.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "clinical-service.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "clinical-service.dll"]
