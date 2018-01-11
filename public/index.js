/* let's go! */
var target = 'heathercoraje';

// building helper functions
function getLanguages (data) {
  return data
    .map(function (eachRepo) {
      return eachRepo.language;
    })
    .reduce(function (a, b) {
      return a.concat((b) && a.indexOf(b) < 0 ? [b] : []);
    }, []);
}

function getName (data) {
  return data.login;
}

function getStars (data) {
  return data.reduce(function (a, b) {
    return a + b.stargazers_count;
  }, 0);
}

// build request function
function request (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200){
      callback(null, xhr.responseText);
    }
    else {
      var errorMessage = xhr.responseText;
      callback(errorMessage); // sending first argument (aka error)
    }
  };
  xhr.open('GET', url, true);
  xhr.send();
}

function getRepoDetails (target) {
  var url = 'https://api.github.com/users/' + target + '/repos';
  request(url, function (error, result) {
    if (error) {
      console.log(error);
      return;
    } // if there is no error(null)
    // console.log('this is result', result);
    getContributors(getUserDetails(result));
  });
}

function getUserDetails (json) {
  var data = JSON.parse(json);// this is result from request
  var dataObj = {
    userDetails: {
      img: data[0].owner.avatar_url,
      repos: data.length,
      languages: getLanguages(data),
      totalStars: getStars(data)
    },
    firstRepo: {
      name: data[0].name,
      url: data[0].html_url,
      date: data[0].created_at.substr(0, 10),
      issues: data[0].open_issues,
      watching: data[0].watchers,
      contributors_url: data[0].contributors_url,
      contributors: []
    }
  };
  return dataObj;
}

function getContributors (dataObj) {
  var url = dataObj.firstRepo.contributors_url;
  request(url, function (error, result) {
    if (error) {
      console.log('Error message' + error);
    }
    updateDom(getContributorDetails(dataObj, result));
  });
}

function getContributorDetails (dataObj, result) {
  // this is new json from contributors_url
  var contributorData = JSON.parse(result);
  var contributors = contributorData.map(getName);
  var firstRepo = Object.assign({}, dataObj.firstRepo, {
    contributors: contributors
  }); // create a new object with contributor info
  console.log(firstRepo);
  console.log(Object.assign({}, dataObj, { firstRepo: firstRepo }));

  return Object.assign({}, dataObj, { firstRepo: firstRepo });
  // this generates the most updated object
}

function updateDom (obj) {
  document.querySelector('#github-user-handle').textContent = target;
  document.querySelector('#github-user-avatar').src = obj.userDetails.img;
  document.querySelector('#github-user-repos').textContent = obj.userDetails.repos;
  document.querySelector('#github-repos-languages').textContent = obj.userDetails.languages.join(', ');
  document.querySelector('#github-repos-stars').textContent = obj.userDetails.totalStars;

  document.querySelector('#github-repo-name').textContent = obj.firstRepo.name;
  document.querySelector('#github-user-link').href = obj.firstRepo.url;
  document.querySelector('#github-repo-created').textContent = obj.firstRepo.date;
  document.querySelector('#github-repo-open-issues').textContent = obj.firstRepo.issues;
  document.querySelector('#github-repo-watchers').textContent = obj.firstRepo.watching;
  document.querySelector('#github-repo-contributors').textContent = obj.firstRepo.contributors.join(', ');
}

getRepoDetails(target);
