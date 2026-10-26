var builder = WebApplication.CreateBuilder(args);

// Add YARP Reverse Proxy services
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Add CORS to allow React Frontend on any local port (5173, 5174, etc.)
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("CorsPolicy");

// Health check endpoint for Gateway status
app.MapGet("/", () => Results.Ok(new
{
    service = "Lexicon.Gateway",
    version = "1.0.0",
    status = "Online",
    architecture = "Microservices API Gateway (YARP)",
    services = new
    {
        auth = "http://localhost:5001",
        library = "http://localhost:5002"
    },
    timestamp = DateTimeOffset.UtcNow
}));

app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    gateway = "Lexicon.Gateway",
    timestamp = DateTimeOffset.UtcNow
}));

// Route requests through YARP Reverse Proxy
app.MapReverseProxy();

app.Run();
