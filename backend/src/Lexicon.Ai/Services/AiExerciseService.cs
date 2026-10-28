using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Lexicon.Ai.Data;
using Lexicon.Common.DTOs;
using Lexicon.Common.Models;

namespace Lexicon.Ai.Services;

public class AiExerciseService : IAiExerciseService
{
    private readonly IAiRepository _repository;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AiExerciseService> _logger;

    public AiExerciseService(
        IAiRepository repository,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<AiExerciseService> logger)
    {
        _repository = repository;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<ApiResponse<AiExerciseDto>> GenerateExerciseAsync(Guid userId, GenerateExerciseRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
        {
            return ApiResponse<AiExerciseDto>.Fail("Please select at least one word or phrase to generate an exercise.");
        }

        try
        {
            // 1. Check if external LLM API key (OpenAI or Gemini) is configured
            var openAiKey = _configuration["AiSettings:OpenAiApiKey"]
                ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            var geminiKey = _configuration["AiSettings:GeminiApiKey"]
                ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

            if (!string.IsNullOrWhiteSpace(openAiKey))
            {
                var externalResult = await TryGenerateWithOpenAiAsync(userId, request, openAiKey);
                if (externalResult != null) return ApiResponse<AiExerciseDto>.Ok(externalResult, "Exercise generated via OpenAI.");
            }
            else if (!string.IsNullOrWhiteSpace(geminiKey))
            {
                var externalResult = await TryGenerateWithGeminiAsync(userId, request, geminiKey);
                if (externalResult != null) return ApiResponse<AiExerciseDto>.Ok(externalResult, "Exercise generated via Gemini.");
            }

            // 2. High-quality Built-in Contextual Memory Generator (100% offline, immediate & deterministic)
            var generated = GenerateBuiltInExercise(userId, request);
            return ApiResponse<AiExerciseDto>.Ok(generated, "Exercise created using Lexicon Intelligent Contextual Memory Engine.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating AI exercise for user {UserId}", userId);
            // Fallback to built-in generator
            var fallback = GenerateBuiltInExercise(userId, request);
            return ApiResponse<AiExerciseDto>.Ok(fallback, "Exercise generated via fallback engine.");
        }
    }

    public async Task<ApiResponse<Guid>> SaveExerciseAsync(Guid userId, SaveExerciseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content) && (request.QuizQuestions == null || request.QuizQuestions.Count == 0))
        {
            return ApiResponse<Guid>.Fail("Cannot save an empty exercise.");
        }

        var id = await _repository.SaveExerciseAsync(userId, request);
        return ApiResponse<Guid>.Ok(id, "Exercise saved to your practice history.");
    }

    public async Task<ApiResponse<List<AiExerciseDto>>> GetUserExercisesAsync(Guid userId)
    {
        var list = await _repository.GetUserExercisesAsync(userId);
        return ApiResponse<List<AiExerciseDto>>.Ok(list);
    }

    public async Task<ApiResponse<AiExerciseDto>> GetExerciseByIdAsync(Guid id, Guid userId)
    {
        var item = await _repository.GetExerciseByIdAsync(id, userId);
        if (item == null) return ApiResponse<AiExerciseDto>.Fail("Exercise not found.");
        return ApiResponse<AiExerciseDto>.Ok(item);
    }

    public async Task<ApiResponse<bool>> DeleteExerciseAsync(Guid id, Guid userId)
    {
        var success = await _repository.DeleteExerciseAsync(id, userId);
        if (!success) return ApiResponse<bool>.Fail("Exercise not found or could not be deleted.");
        return ApiResponse<bool>.Ok(true, "Exercise deleted successfully.");
    }

    #region Built-In Contextual Memory Engine

    private AiExerciseDto GenerateBuiltInExercise(Guid userId, GenerateExerciseRequest request)
    {
        var items = request.Items;
        var terms = items.Select(i => i.TermOrPhrase).ToList();
        var type = request.ExerciseType.ToLowerInvariant();

        return type switch
        {
            "dialogue" => GenerateConversationalDialogue(userId, request),
            "quiz" => GenerateClozeQuiz(userId, request),
            _ => GenerateNarrativeStory(userId, request)
        };
    }

    private AiExerciseDto GenerateNarrativeStory(Guid userId, GenerateExerciseRequest request)
    {
        var items = request.Items;
        var tone = request.Tone?.ToLowerInvariant() ?? "literary";
        var title = GenerateTitle(items, "Narrative Memory Tapestry");

        var sb = new StringBuilder();

        // Introductory paragraph framing the scenario
        if (tone == "humorous")
        {
            sb.Append("What began as an ordinary Tuesday quickly spiraled into an unpredictable comedy of circumstances. ");
        }
        else if (tone == "philosophical")
        {
            sb.Append("In the quiet spaces of late evening reflection, the mind wanders into intricate observations about existence. ");
        }
        else
        {
            sb.Append("The morning arrived with a cool, contemplative stillness over the city. ");
        }

        // Weave each target word/phrase into an evocative sentence
        for (int i = 0; i < items.Count; i++)
        {
            var item = items[i];
            var term = item.TermOrPhrase;
            var definition = item.Definition;

            var sentence = BuildStorySentence(term, item.Type, definition, item.ExampleSentence, i, items.Count, tone);
            sb.Append(sentence).Append(' ');
        }

        // Concluding reflection linking back to memory retention
        sb.Append("Reflecting on the encounter, it became clear how subtle nuances of expression transform fleeting moments into lasting understanding.");

        var content = sb.ToString();

        var tips = $"Memory Mnemonic: Visualize each highlighted term in the setting of this story. Re-reading this scene twice within 48 hours reinforces semantic encoding by over 70%.";

        return new AiExerciseDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            ExerciseType = "story",
            Tone = request.Tone,
            Content = content,
            HighlightedVocabulary = items.Select(x => x.TermOrPhrase).ToList(),
            TargetItems = items,
            TipsForRetention = tips,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private AiExerciseDto GenerateConversationalDialogue(Guid userId, GenerateExerciseRequest request)
    {
        var items = request.Items;
        var title = GenerateTitle(items, "Conversational Exchange");
        var dialogueTurns = new List<DialogueTurn>();

        string[] speakers = { "Elena", "Marcus" };
        var fullScript = new StringBuilder();

        fullScript.AppendLine($"**Setting**: A sunlit corner of an independent library cafe, discussing observations over steaming cups of coffee.\n");

        for (int i = 0; i < items.Count; i++)
        {
            var item = items[i];
            var speaker = speakers[i % 2];
            var otherSpeaker = speakers[(i + 1) % 2];

            string turnText;
            if (i == 0)
            {
                turnText = item.Type == "phrase"
                    ? $"Have you ever felt that when difficulties pile up, you just have to **{item.TermOrPhrase}** to see things through?"
                    : $"I was reading earlier and came across the concept of **{item.TermOrPhrase}**—meaning {item.Definition.ToLowerInvariant()}. It captured my thoughts completely.";
            }
            else if (i % 2 == 1)
            {
                turnText = item.Type == "phrase"
                    ? $"That resonates with me. Sometimes events seem chaotic at first, but prove to be **{item.TermOrPhrase}** once the bigger picture unfolds."
                    : $"Exactly. It's just like how **{item.TermOrPhrase}** manifests in everyday life—especially when {item.Definition.ToLowerInvariant()}.";
            }
            else
            {
                turnText = item.Type == "phrase"
                    ? $"I agree wholeheartedly. It reminds me that sticking together **{item.TermOrPhrase}** is what gives meaningful work its durability."
                    : $"And when you pause to notice **{item.TermOrPhrase}**, it completely alters your perspective on ordinary surroundings.";
            }

            dialogueTurns.Add(new DialogueTurn
            {
                Speaker = speaker,
                Speech = turnText,
                HighlightedWords = new List<string> { item.TermOrPhrase }
            });

            fullScript.AppendLine($"**{speaker}**: \"{turnText}\"\n");
        }

        // Final turn
        var closingSpeaker = speakers[items.Count % 2];
        var closingLine = "It's fascinating how having the precise vocabulary gives shape to experiences we all feel but seldom articulate.";
        dialogueTurns.Add(new DialogueTurn
        {
            Speaker = closingSpeaker,
            Speech = closingLine,
            HighlightedWords = new List<string>()
        });
        fullScript.AppendLine($"**{closingSpeaker}**: \"{closingLine}\"");

        var tips = "Conversational Recall Tip: Read this dialogue aloud, speaking each character's lines with natural pacing. Vocalizing words cements auditory memory channels.";

        return new AiExerciseDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            ExerciseType = "dialogue",
            Tone = request.Tone,
            Content = fullScript.ToString(),
            HighlightedVocabulary = items.Select(x => x.TermOrPhrase).ToList(),
            TargetItems = items,
            DialogueTurns = dialogueTurns,
            TipsForRetention = tips,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private AiExerciseDto GenerateClozeQuiz(Guid userId, GenerateExerciseRequest request)
    {
        var items = request.Items;
        var title = GenerateTitle(items, "Interactive Memory Retention Quiz");
        var questions = new List<ClozeQuestion>();

        // Build a pool of all terms for distractor options
        var allTerms = items.Select(i => i.TermOrPhrase).ToList();
        var genericDistractors = new[] { "Resilience", "Paradigm", "Equanimity", "Nostalgia", "Catharsis", "Pragmatism" };

        for (int i = 0; i < items.Count; i++)
        {
            var item = items[i];
            var correct = item.TermOrPhrase;

            // Generate realistic sentence with blank
            string sentenceWithBlank;
            if (!string.IsNullOrWhiteSpace(item.ExampleSentence) && item.ExampleSentence.Contains(correct, StringComparison.OrdinalIgnoreCase))
            {
                // Replace word in example sentence with blank
                sentenceWithBlank = Regex.Replace(
                    item.ExampleSentence,
                    Regex.Escape(correct),
                    "__________",
                    RegexOptions.IgnoreCase);
            }
            else
            {
                sentenceWithBlank = item.Type == "phrase"
                    ? $"When faced with sudden adversity, the team knew they had to __________ rather than hesitate."
                    : $"The speaker's words possessed a rare __________, captivating everyone in the auditorium with effortless resonance.";
            }

            // Create 4 distinct options (1 correct + 3 distractors)
            var distractors = allTerms
                .Where(t => !string.Equals(t, correct, StringComparison.OrdinalIgnoreCase))
                .Concat(genericDistractors)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(3)
                .ToList();

            var options = new List<string>(distractors) { correct };
            // Shuffle deterministically based on term hash
            var rng = new Random(correct.GetHashCode());
            options = options.OrderBy(_ => rng.Next()).ToList();

            questions.Add(new ClozeQuestion
            {
                QuestionNumber = i + 1,
                SentenceWithBlank = sentenceWithBlank,
                CorrectAnswer = correct,
                Options = options,
                ContextHint = $"Clue: {item.Definition}",
                Explanation = $"'{correct}' refers to: {item.Definition}."
            });
        }

        var tips = "Cloze / Retrieval Practice Tip: Active retrieval (testing yourself before looking at answers) strengthens neural pathways up to 3x more effectively than passive re-reading.";

        return new AiExerciseDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            ExerciseType = "quiz",
            Tone = request.Tone,
            Content = $"Complete the {questions.Count} fill-in-the-blank questions below to lock this vocabulary into active memory.",
            HighlightedVocabulary = items.Select(x => x.TermOrPhrase).ToList(),
            TargetItems = items,
            QuizQuestions = questions,
            TipsForRetention = tips,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private string BuildStorySentence(string term, string type, string definition, string? example, int index, int total, string tone)
    {
        if (!string.IsNullOrWhiteSpace(example) && example.Contains(term, StringComparison.OrdinalIgnoreCase))
        {
            return example;
        }

        if (type == "phrase")
        {
            return $"Recognizing that delay would only worsen the dilemma, she decided to **{term}**, confronting the reality directly with poise.";
        }

        return index switch
        {
            0 => $"There was an undeniable quality of **{term}** in the atmosphere—characterized by {definition.ToLowerInvariant()}.",
            1 => $"Every detail seemed touched by **{term}**, inviting a quiet contemplation that rarely surfaces amidst modern rush.",
            2 => $"Even the casual observer could sense **{term}**, leaving an indelible impression on everyone who shared the space.",
            _ => $"In that singular instant, **{term}** revealed how deeply {definition.ToLowerInvariant()} can resonate."
        };
    }

    private string GenerateTitle(List<TargetVocabularyItem> items, string defaultType)
    {
        var sampleWords = string.Join(", ", items.Take(3).Select(i => i.TermOrPhrase));
        if (items.Count > 3) sampleWords += " & more";
        return $"{defaultType}: {sampleWords}";
    }

    #endregion

    #region External LLM Integrations (OpenAI & Gemini)

    private async Task<AiExerciseDto?> TryGenerateWithOpenAiAsync(Guid userId, GenerateExerciseRequest request, string apiKey)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var prompt = BuildPrompt(request);

            var body = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = "You are a master lexicographer and cognitive memory specialist. Create educational, memorable vocabulary exercises." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.7,
                response_format = new { type = "json_object" }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("OpenAI returned status {StatusCode}, falling back to built-in generator.", response.StatusCode);
                return null;
            }

            var respJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(respJson);
            var contentStr = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            if (string.IsNullOrWhiteSpace(contentStr)) return null;

            return ParseAiJsonToDto(contentStr, userId, request);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OpenAI generation failed, proceeding with built-in engine.");
            return null;
        }
    }

    private async Task<AiExerciseDto?> TryGenerateWithGeminiAsync(Guid userId, GenerateExerciseRequest request, string apiKey)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var prompt = BuildPrompt(request);

            var body = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    responseMimeType = "application/json",
                    temperature = 0.7
                }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
            var response = await client.PostAsync(url, jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Gemini returned status {StatusCode}, falling back to built-in generator.", response.StatusCode);
                return null;
            }

            var respJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(respJson);
            var text = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

            if (string.IsNullOrWhiteSpace(text)) return null;

            return ParseAiJsonToDto(text, userId, request);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini generation failed, proceeding with built-in engine.");
            return null;
        }
    }

    private string BuildPrompt(GenerateExerciseRequest request)
    {
        var terms = string.Join(", ", request.Items.Select(i => $"\"{i.TermOrPhrase}\" ({i.Type}: {i.Definition})"));
        return $@"
Create a vocabulary practice exercise for keeping words in long-term memory.
Target items: {terms}
Exercise Type: {request.ExerciseType}
Tone: {request.Tone}
Difficulty: {request.Difficulty}

Return pure JSON matching this schema:
{{
  ""title"": ""A descriptive title"",
  ""content"": ""The narrative story or dialogue text with target words in **bold**"",
  ""highlightedVocabulary"": [""word1"", ""phrase2""],
  ""tipsForRetention"": ""Contextual memory mnemonic tip"",
  ""quizQuestions"": [
    {{
      ""questionNumber"": 1,
      ""sentenceWithBlank"": ""Sentence with _______ blank"",
      ""correctAnswer"": ""target_word"",
      ""options"": [""option1"", ""option2"", ""option3"", ""option4""],
      ""contextHint"": ""Hint clue"",
      ""explanation"": ""Why this word fits""
    }}
  ]
}}";
    }

    private AiExerciseDto? ParseAiJsonToDto(string json, Guid userId, GenerateExerciseRequest request)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var title = root.TryGetProperty("title", out var tProp) ? tProp.GetString() ?? "AI Vocabulary Exercise" : "AI Vocabulary Exercise";
            var content = root.TryGetProperty("content", out var cProp) ? cProp.GetString() ?? "" : "";
            var tips = root.TryGetProperty("tipsForRetention", out var tipProp) ? tipProp.GetString() ?? "" : "";

            var highlighted = new List<string>();
            if (root.TryGetProperty("highlightedVocabulary", out var hlProp) && hlProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var el in hlProp.EnumerateArray())
                {
                    var s = el.GetString();
                    if (!string.IsNullOrWhiteSpace(s)) highlighted.Add(s);
                }
            }
            if (highlighted.Count == 0) highlighted = request.Items.Select(x => x.TermOrPhrase).ToList();

            List<ClozeQuestion>? quiz = null;
            if (root.TryGetProperty("quizQuestions", out var qProp) && qProp.ValueKind == JsonValueKind.Array)
            {
                quiz = JsonSerializer.Deserialize<List<ClozeQuestion>>(qProp.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }

            return new AiExerciseDto
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = title,
                ExerciseType = request.ExerciseType,
                Tone = request.Tone,
                Content = content,
                HighlightedVocabulary = highlighted,
                TargetItems = request.Items,
                QuizQuestions = quiz,
                TipsForRetention = tips,
                CreatedAt = DateTimeOffset.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse external LLM JSON, falling back to built-in generator.");
            return null;
        }
    }

    #endregion
}
