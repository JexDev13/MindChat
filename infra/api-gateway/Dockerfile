FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["infra/api-gateway/api-gateway.csproj", "infra/api-gateway/"]
RUN dotnet restore "infra/api-gateway/api-gateway.csproj"

COPY infra/api-gateway/ infra/api-gateway/
WORKDIR "/src/infra/api-gateway"
RUN dotnet build "api-gateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "api-gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "api-gateway.dll"]
