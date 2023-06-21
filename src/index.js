const API_KEY = '37660619-57c515de7526ffff07433eaf8';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a');

let currentPage = 1;
let currentSearchQuery = '';

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const searchQuery = searchForm.searchQuery.value.trim();
  if (searchQuery === '') return;

  currentPage = 1;
  currentSearchQuery = searchQuery;
  gallery.innerHTML = '';

  await fetchImages(currentSearchQuery, currentPage);

  if (gallery.childElementCount > 0) {
    loadMoreBtn.style.display = 'block';
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  } else {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  await fetchImages(currentSearchQuery, currentPage);
});

async function fetchImages(query, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: page,
      },
    });

    const { hits, totalHits } = response.data;
    if (hits.length > 0) {
      hits.forEach(image => {
        const photoCard = createPhotoCard(image);
        gallery.appendChild(photoCard);
      });

      lightbox.refresh();
      window.scrollBy({
        top: gallery.firstElementChild.getBoundingClientRect().height * 2,
        behavior: 'smooth',
      });
    }

    if (hits.length === totalHits) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again.');
  }
}

function createPhotoCard(image) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = image;

  const photoCard = document.createElement('div');
  photoCard.classList.add('photo-card');

  const imageLink = document.createElement('a');
  imageLink.href = largeImageURL;

  const img = document.createElement('img');
  img.src = webformatURL;
  img.alt = tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.classList.add('info');

  const likesInfo = createInfoItem('Likes', likes);
  const viewsInfo = createInfoItem('Views', views);
  const commentsInfo = createInfoItem('Comments', comments);
  const downloadsInfo = createInfoItem('Downloads', downloads);

  info.append(likesInfo, viewsInfo, commentsInfo, downloadsInfo);
  imageLink.append(img, info);
  photoCard.appendChild(imageLink);

  return photoCard;
}

function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.classList.add('info-item');
  item.innerHTML = `<b>${label}:</b> ${value}`;
  return item;
}
