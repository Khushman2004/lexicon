namespace Lexicon.Common.Security;

public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = "LexiconSuperSecretJwtEncryptionKey2026!MicroservicesArchitectureSecure";
    public string Issuer { get; set; } = "Lexicon.Gateway";
    public string Audience { get; set; } = "Lexicon.Clients";
    public int ExpiryInMinutes { get; set; } = 1440; // 24 hours
}
