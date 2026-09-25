const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
const resultCountText = document.getElementById('result-count');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return; // ignore empty searches

    resultCountText.textContent = `Searching for "${query}"...`;
    
    // Build the Wikimedia API URL
    const url = "https://commons.wikimedia.org/w/api.php?action=query" +
                "&generator=search&gsrsearch=" + encodeURIComponent(query) +
                "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();
        
        let items = [];
        if (data.query && data.query.pages) {
            items = Object.values(data.query.pages);
        }

        render(items, query);
    } catch (error) {
        console.error("Error fetching data:", error);
        resultCountText.textContent = `Failed to fetch results. Please try again.`;
    }
});

function render(items, query) {
    resultsContainer.innerHTML = ""; // clear old results first
    
    // Enhancement 1: display a result count
    if (items.length === 0) {
        resultCountText.textContent = `No results found for "${query}".`;
        return;
    }
    resultCountText.textContent = `Showing ${items.length} results for "${query}"`;

    items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "card";
        
        // Enhancement 2: make each card a link that opens the full image in a new tab
        const link = document.createElement("a");
        if (item.imageinfo && item.imageinfo[0]) {
            link.href = item.imageinfo[0].url; // Original image URL
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
        
        const img = document.createElement("img");
        if (item.imageinfo && item.imageinfo[0]) {
            img.src = item.imageinfo[0].thumburl; // Thumbnail image URL
        }
        
        // Clean the title for better presentation
        let cleanTitle = item.title.replace(/^File:/, '').replace(/\.[^/.]+$/, "");
        img.alt = cleanTitle;

        const caption = document.createElement("p");
        caption.textContent = cleanTitle;
        
        link.appendChild(img);
        link.appendChild(caption);
        card.appendChild(link);
        
        resultsContainer.appendChild(card);
    });
}
