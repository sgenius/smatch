# Adapted from https://gist.github.com/nathansmith/1179395

environment = :development

output_style = (environment == :production) ? :compressed : :expanded;
sourcemap = (environment == :production) ? false : true;


referred_syntax = :scss
http_path = '/'
css_dir = 'css'
sass_dir = 'css/scss'
images_dir = 'images'
fonts_dir = 'fonts'
javascripts_dir = 'js'
relative_assets = true
line_comments = true


# Function from http://compass-style.org/help/documentation/configuration-reference/
# Increment the deploy_version before every release to force cache busting.
deploy_version = 1
asset_cache_buster do |http_path, file|
  if file
    file.mtime.strftime("%s")
  else
    "v=#{deploy_version}"
  end
end

# output_style = :compressed