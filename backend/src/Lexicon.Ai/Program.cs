using Lexicon.Ai.Data;
using Lexicon.Ai.Services;
using Lexicon.Common.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHttpClient();

// Register repositories and services
builder.Services.AddScoped<IAiRepository, AiRepository>();
builder.Services.AddScoped<IAiExerciseService, AiExerciseService>();

// Configure JWT Authentication using shared extension
builder.Services.AddLexiconJwtAuthentication(builder.Configuration);

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
