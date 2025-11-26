namespace MindChat.Application.Helpers
{
    public static class UsernameGenerator
    {
        private static readonly string[] Separators = { "_", "-", "." };
        private static readonly Random Rand = new();

        public static string Generate(string firstName, string lastName)
        {
            var first = firstName?.Trim().ToLower() ?? "";
            var last = lastName?.Trim().ToLower() ?? "";

            string firstPart = first.Length >= 3 ? first[..3] : first;
            string lastPart = last.Length >= 3 ? last[..3] : last;

            string separator = Separators[Rand.Next(Separators.Length)];
            string number = Rand.Next(0, 100).ToString("00");

            return $"{firstPart}{separator}{lastPart}{number}";
        }
    }
}
