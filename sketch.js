let map, cover, final_output;
let map_radius = 500;
let PI = Math.PI;
let TWOPI = Math.PI * 2;
let HALFPI = Math.PI / 2;

let sidereal_year = 365.256363;
let axial_tilt = 23.44 * PI / 180;
let equatorial_radius = 6378.137;
let polar_radius = 6356.752;
let earth_coords;
let hours = 24;
let twilight_increment = 6;

let time;
let set_date = 90;
let sidereal_time;
let sidereal_time_offset;

let local_latitude = 40 * PI / 180;
let local_longitude = 70 * PI / 180;

let earth = ["Earth", 149598023, sidereal_year, 0.0167, 0, 102.94719 * PI / 180, 0, -0.05160727151];
let timezone = 5;
let no_timezone = false;

let solar_terms;

function setup() {
    let W = Math.min(windowWidth, windowHeight) * 0.95;
    createCanvas(W, W);

    map = createGraphics(1200, 1200);
    map.translate(map.width / 2, map.height / 2);
    map.scale(1, -1);
    final_output = createGraphics(1200, 1200);
    cover = createGraphics(1200, 1200);
    cover.noStroke();
    cover.fill(255);
    cover.rect(0, 0, cover.width, cover.height);
    cover.fill(0);
    cover.textSize(50);
    cover.textAlign(CENTER, BASELINE);
    let directions = ["345", "330", "315", "300", "285", "W", "255", "240", "225", "210", "195", "S", "175", "150", "135", "120", "105",
        "E", "75", "60", "45", "30", "15", "N"];
    for (let i = 0; i < 24; i++) {
        cover.push();
        cover.translate(cover.width / 2, cover.height / 2);
        cover.rotate(TWOPI / 24 * (i + 1));
        cover.textSize(30);
        if ((i + 1) % 6 == 0) {
            cover.textSize(50);
        }
        cover.text(directions[i], 0, -520);
        cover.pop();
    }
    cover.erase();
    cover.ellipse(cover.width / 2, cover.height / 2, cover.width * 5 / 6, cover.height * 5 / 6);
    cover.noErase();
    cover.stroke(0);
    cover.noFill();
    cover.strokeWeight(2);
    cover.ellipse(cover.width / 2, cover.height / 2, cover.width * 5 / 6, cover.height * 5 / 6);
    draw_grids();


}

function draw() {
    map.background(255);
    sidereal_time_offset = calculate_sidereal_time_offset();

    let sun_path_thickness = 1.5;
    let sun_path_color = color(255, 179, 0);

    for (let i = 0; i < hours; i++) {
        let last;
        for (let j = 0; j < Math.ceil(sidereal_year) + 1; j += 1) {
            time = j + i / hours - timezone / hours;
            if (no_timezone) {
                time = j + i / hours - local_longitude / TWOPI;
            }
            sidereal_time = (((sidereal_year + 1) / sidereal_year * time - sidereal_time_offset) % 1) * TWOPI;
            earth_coords = calculate_planet(earth);
            let screen_coords = draw_sun(1.2, 255, 179, 0);
            if (j % 5 <= 1) {
                last = [screen_coords[0], screen_coords[1]];
            } else {
                map.strokeWeight(sun_path_thickness);
                map.stroke(sun_path_color);
                map.line(screen_coords[0], screen_coords[1], last[0], last[1]);
                last = [screen_coords[0], screen_coords[1]];
            }
        }
    }
    solar_terms = calculate_solar_terms();
    for (let i = 0; i < solar_terms.length; i++) {
        let last;
        if (i <= 3 || i == 7) {
            for (let j = 0; j < 1; j += 0.001) {
                time = Math.floor(solar_terms[i]) + j - timezone / hours;
                if (no_timezone) {
                    time = Math.floor(solar_terms[i]) + j - local_longitude / TWOPI;
                }
                sidereal_time = (((sidereal_year + 1) / sidereal_year * time - sidereal_time_offset) % 1) * TWOPI;
                earth_coords = calculate_planet(earth);
                let screen_coords = draw_sun();
                if (j == 0) {
                    last = [screen_coords[0], screen_coords[1]];
                } else {
                    map.strokeWeight(sun_path_thickness);
                    map.stroke(sun_path_color);
                    map.line(screen_coords[0], screen_coords[1], last[0], last[1]);
                    last = [screen_coords[0], screen_coords[1]];
                }
            }
        }
    }

    sun_path_color = color(255, 0, 0);
    sun_path_thickness = 2;
    last = [];
    for (let i = 0; i < 1; i += 0.001) {
        time = Math.floor(set_date) + i - timezone / hours;
        if (no_timezone) {
            time = Math.floor(set_date) + i - local_longitude / TWOPI;
        }
        sidereal_time = (((sidereal_year + 1) / sidereal_year * time - sidereal_time_offset) % 1) * TWOPI;
        earth_coords = calculate_planet(earth);
        let screen_coords = draw_sun();
        if (i == 0) {
            last = [screen_coords[0], screen_coords[1]];
        } else {
            map.strokeWeight(sun_path_thickness);
            map.stroke(sun_path_color);
            map.line(screen_coords[0], screen_coords[1], last[0], last[1]);
            last = [screen_coords[0], screen_coords[1]];
        }
    }
    let sun_thickness = 10;
    for (let i = 0; i < hours; i++) {
        time = Math.floor(set_date) + i / hours - timezone / hours;;
        if (no_timezone) {
            time = Math.floor(set_date) + i / hours - local_longitude / TWOPI;
        }
        sidereal_time = (((sidereal_year + 1) / sidereal_year * time - sidereal_time_offset) % 1) * TWOPI;
        earth_coords = calculate_planet(earth);
        map.stroke(sun_path_color);
        screen_coords = draw_sun();
        if (screen_coords[2] < HALFPI) {
            map.fill(255);
            map.ellipse(screen_coords[0], screen_coords[1], sun_thickness, sun_thickness);
            map.fill(0);
            map.noStroke();
            map.textSize(20);
            map.textAlign(LEFT, BASELINE);
            map.scale(1, -1);
            let time_text = String(Math.round(i) % hours).padStart(2, '0');
            if (no_timezone) {
                time_text = String(Math.round(i) % hours).padStart(2, '0');
            }
            let x_offset = 7;
            let y_offset = -7;
            if (screen_coords[0] > 0) {
                x_offset = -8;
                map.textAlign(RIGHT);
            }
            if (screen_coords[1] > 0) {
                y_offset = 23;
                map.textAlign(TOP);
            }
            map.text(time_text, screen_coords[0] + x_offset, -screen_coords[1] + y_offset);
            map.scale(1, -1);
        }
    }


    final_output.image(map, 0, 0);
    final_output.image(cover, 0, 0);
    final_output.fill(0);
    final_output.noStroke();
    final_output.textAlign(LEFT);
    final_output.textSize(30);

    let timezone_text = "+";
    if (timezone < 0) {
        timezone_text = "";
    }
    if (no_timezone) {
        final_output.text(`LOCAL SOLAR TIME`, 10, 30);
    } else {
        final_output.text(`TIMEZONE ${timezone_text}${timezone.toFixed(0)} hr`, 10, 30);
    }
    final_output.text(`DATE ${set_date} dy`, 10, 65);
    final_output.textAlign(RIGHT);
    final_output.text(`LAT ${(local_latitude * 180 / PI).toFixed(2)}\u00B0, LONG ${(local_longitude * 180 / PI).toFixed(2)}\u00B0`, final_output.width - 10, 30);
    image(final_output, 0, 0, width, height);

    make_stats();
    noLoop();
}

function ecliptic_to_equatorial_xyz(coords) {
    let x = coords[0];
    let y = coords[1];
    let z = coords[2];

    let x_new = x;
    let y_new = Math.cos(axial_tilt) * y - Math.sin(axial_tilt) * z;
    let z_new = Math.sin(axial_tilt) * y + Math.cos(axial_tilt) * z;

    return [x_new, y_new, z_new, coords[3]];
}

function equatorial_to_horizontal_xyz(coords) {
    let x = coords[0];
    let y = coords[1];
    let z = coords[2];
    let distance = coords[3];

    let declination = Math.asin(z / distance);
    let right_ascension = Math.atan2(y, x);
    let hour_angle = sidereal_time + local_longitude - right_ascension;

    x = distance * Math.cos(declination) * Math.cos(hour_angle);
    y = distance * Math.cos(declination) * Math.sin(hour_angle);

    let observer = current_observer_coordinates();

    let new_x = (-Math.sin(local_latitude) * x + Math.cos(local_latitude) * z) - observer[0];
    let new_y = -y - observer[1];
    let new_z = (Math.cos(local_latitude) * x + Math.sin(local_latitude) * z) - observer[2];

    let new_distance = Math.sqrt(new_x * new_x + new_y * new_y + new_z * new_z);

    return [new_x, new_y, new_z, new_distance];
}

function horizontal_to_screen(azimuth, zenith_distance) {
    let radius = zenith_distance * map_radius / HALFPI;
    return [-radius * Math.sin(azimuth), radius * Math.cos(azimuth)];
}

function draw_grids() {
    let altitude_number = 6;
    let azimuth_number = 24;
    cover.translate(cover.width / 2, cover.height / 2);
    for (let i = 1; i < altitude_number; i++) {
        cover.noFill();
        cover.stroke(0, 30);
        cover.ellipse(0, 0, map_radius / altitude_number * i * 2, map_radius / altitude_number * i * 2);
        cover.textAlign(CENTER, CENTER);
        cover.fill(0, 100);
        cover.noStroke();
        cover.textSize(25);
        cover.text(90 - 90 / altitude_number * i, 0, -map_radius / altitude_number * i - 12);
    }
    cover.stroke(0, 30);
    for (let i = 0; i < azimuth_number; i++) {
        cover.line(0, 0, -map_radius * Math.sin(TWOPI / azimuth_number * i), map_radius * Math.cos(TWOPI / azimuth_number * i))
    }
}

function current_observer_coordinates() {
    if (polar_radius == 0 || equatorial_radius == 0) {
        return [0, 0, 0];
    }
    let geocentric_latitude = Math.atan(polar_radius * polar_radius / equatorial_radius * equatorial_radius * Math.tan(local_latitude));
    let cosine = Math.cos(geocentric_latitude);
    let sine = Math.sin(geocentric_latitude);
    let earth_radius = equatorial_radius * polar_radius / Math.sqrt(polar_radius * polar_radius * cosine * cosine + equatorial_radius * equatorial_radius * sine * sine);
    return [-earth_radius * Math.sin(local_latitude - geocentric_latitude), 0, earth_radius * Math.cos(local_latitude - geocentric_latitude), earth_radius];
}

function calculate_sun_equatorial() {
    let sun_coords = [-earth_coords[0], -earth_coords[1], -earth_coords[2], earth_coords[3]];
    return ecliptic_to_equatorial_xyz(sun_coords);
}

function draw_sun() {
    let sun_coords = equatorial_to_horizontal_xyz(calculate_sun_equatorial());
    let azimuth = Math.atan2(sun_coords[1], sun_coords[0]);
    let zenith_distance = HALFPI - Math.asin(sun_coords[2] / sun_coords[3]);
    let screen_coords = horizontal_to_screen(azimuth, zenith_distance);
    screen_coords.push(zenith_distance);
    return screen_coords;
}

function calculate_planet(planet) {
    let SMA = planet[1];
    let period = planet[2];
    let ecc = planet[3];
    let LOAN = planet[4];
    let AOP = planet[5];
    let inc = planet[6];
    let offset = planet[7];

    let mean = offset + TWOPI / period * (time % period);
    let eccentric = mean - (mean - ecc * Math.sin(mean) - mean) / (1 - ecc * Math.cos(mean));
    for (let i = 0; i < 15; i++) {
        eccentric = eccentric - (eccentric - ecc * Math.sin(eccentric) - mean) / (1 - ecc * Math.cos(eccentric));
    }
    let x_perifocal = SMA * Math.cos(eccentric) - SMA * ecc;
    let y_perifocal = SMA * Math.sqrt(1 - ecc * ecc) * Math.sin(eccentric);
    let distance = Math.sqrt(x_perifocal * x_perifocal + y_perifocal * y_perifocal);

    let cosLOAN = Math.cos(LOAN);
    let sinLOAN = Math.sin(LOAN);
    let cosAOP = Math.cos(AOP);
    let sinAOP = Math.sin(AOP);
    let cosINC = Math.cos(inc);
    let sinINC = Math.sin(inc);

    let M1 = cosLOAN * cosAOP - sinLOAN * cosINC * sinAOP;
    let M2 = -cosLOAN * sinAOP - sinLOAN * cosINC * cosAOP;
    let M4 = sinLOAN * cosAOP + cosLOAN * cosINC * sinAOP;
    let M5 = -sinLOAN * sinAOP + cosLOAN * cosINC * cosAOP;
    let M7 = sinINC * sinAOP;
    let M8 = sinINC * cosAOP;

    let x = M1 * x_perifocal + M2 * y_perifocal;
    let y = M4 * x_perifocal + M5 * y_perifocal;
    let z = M7 * x_perifocal + M8 * y_perifocal;
    return [x, y, z, distance];
}

function calculate_sidereal_time_offset() {
    let mean = earth[7];
    let AOP = earth[5];
    let mean_sun = AOP + mean + PI;
    if (mean_sun > TWOPI) {
        mean_sun -= TWOPI;
    } else if (mean_sun < 0) {
        mean_sun += TWOPI;
    }
    return (0.5 - mean_sun / TWOPI) % 1;
}

function calculate_solar_terms() {
    let longitudes = [-HALFPI / 2, 0, HALFPI / 2, HALFPI, HALFPI * 3 / 2, PI, HALFPI * 5 / 2, PI * 3 / 2];
    let output = [];
    let AOP = earth[5];
    let ecc = earth[3];
    let mean_offset = earth[7];
    for (let i = 0; i < longitudes.length; i++) {
        let true_anomaly = PI + longitudes[i] - AOP;
        if (true_anomaly < 0) {
            true_anomaly += TWOPI;
        } else if (true_anomaly > TWOPI) {
            true_anomaly -= TWOPI;
        }
        let eccentric = Math.acos((ecc + Math.cos(true_anomaly)) / (1 + ecc * Math.cos(true_anomaly)));
        if (true_anomaly > PI) {
            eccentric *= -1;
        }
        let mean = eccentric - ecc * Math.sin(eccentric);
        mean = (mean - mean_offset) * sidereal_year / TWOPI;

        if (mean < 0) {
            mean += sidereal_year;
        }
        output.push(mean);
    }
    return output;
}

function calculate_altitude(alt, sign) {
    let observer_equatorial_coordinates = [0, 0, 0];
    let geocentric_latitude, cosine, sine, earth_radius;

    time = set_date + 0.5;
    earth_coords = calculate_planet(earth);
    let sun_coords = calculate_sun_equatorial();
    sun_coords = [sun_coords[0] - observer_equatorial_coordinates[0], sun_coords[1] - observer_equatorial_coordinates[1], sun_coords[2] - observer_equatorial_coordinates[2]];
    let distance = Math.sqrt(sun_coords[0] * sun_coords[0] + sun_coords[1] * sun_coords[1] + sun_coords[2] * sun_coords[2]);
    let right_ascension = Math.atan2(sun_coords[1], sun_coords[0]);
    let declination = Math.asin(sun_coords[2] / distance);
    let hour_angle = sign * Math.acos((Math.sin(alt) - Math.sin(local_latitude) * Math.sin(declination)) / (Math.cos(local_latitude) * Math.cos(declination)));
    let standard_sidereal_time = hour_angle + right_ascension - local_longitude;
    let guess = Math.round(set_date * (sidereal_year + 1) / sidereal_year - sidereal_time_offset);
    time = (guess + standard_sidereal_time / TWOPI + sidereal_time_offset) * sidereal_year / (sidereal_year + 1);
    sidereal_time = (((sidereal_year + 1) / sidereal_year * time - sidereal_time_offset) % 1) * TWOPI;

    if (polar_radius != 0 && equatorial_radius != 0) {
        geocentric_latitude = Math.atan(polar_radius * polar_radius / equatorial_radius * equatorial_radius * Math.tan(local_latitude));
        cosine = Math.cos(geocentric_latitude);
        sine = Math.sin(geocentric_latitude);
        earth_radius = equatorial_radius * polar_radius / Math.sqrt(polar_radius * polar_radius * cosine * cosine + equatorial_radius * equatorial_radius * sine * sine);
    }

    for (let i = 0; i < 20; i++) {
        if (polar_radius != 0 && equatorial_radius != 0) {
            let x = earth_radius * cosine * Math.cos(sidereal_time);
            let y = earth_radius * cosine * Math.sin(sidereal_time);
            let z = earth_radius * sine;
            observer_equatorial_coordinates = [x, y, z];
        }

        earth_coords = calculate_planet(earth);
        sun_coords = calculate_sun_equatorial();
        sun_coords = [sun_coords[0] - observer_equatorial_coordinates[0], sun_coords[1] - observer_equatorial_coordinates[1], sun_coords[2] - observer_equatorial_coordinates[2]];
        distance = Math.sqrt(sun_coords[0] * sun_coords[0] + sun_coords[1] * sun_coords[1] + sun_coords[2] * sun_coords[2]);
        right_ascension = Math.atan2(sun_coords[1], sun_coords[0]);
        declination = Math.asin(sun_coords[2] / distance);
        hour_angle = sign * Math.acos((Math.sin(alt) - Math.sin(local_latitude) * Math.sin(declination)) / (Math.cos(local_latitude) * Math.cos(declination)));
        standard_sidereal_time = hour_angle + right_ascension - local_longitude;
        guess = Math.round(set_date * (sidereal_year + 1) / sidereal_year - sidereal_time_offset);
        time = (guess + standard_sidereal_time / TWOPI + sidereal_time_offset) * sidereal_year / (sidereal_year + 1);
        sidereal_time = (((sidereal_year + 1) / sidereal_year * time - sidereal_time_offset) % 1) * TWOPI;
    }
    let result = (time % 1) * hours + timezone;
    if (no_timezone) {
        result = (time % 1) * hours + local_longitude / TWOPI * hours;
    }
    if (result < 0) {
        result += hours;
    } else if (result > hours) {
        result -= hours;
    }
    return result;
}

function calculate_meridian_pass(mode) {
    let observer_equatorial_coordinates = [0, 0, 0];
    let geocentric_latitude, cosine, sine, earth_radius;

    time = set_date + 0.5;
    earth_coords = calculate_planet(earth);
    let sun_coords = calculate_sun_equatorial();
    sun_coords = [sun_coords[0] - observer_equatorial_coordinates[0], sun_coords[1] - observer_equatorial_coordinates[1], sun_coords[2] - observer_equatorial_coordinates[2]];
    let right_ascension = Math.atan2(sun_coords[1], sun_coords[0]);
    let hour_angle = 0;
    if (mode == -1) {
        hour_angle = PI;
    }
    let standard_sidereal_time = hour_angle + right_ascension - local_longitude;
    let guess = Math.round(set_date * (sidereal_year + 1) / sidereal_year - sidereal_time_offset);
    time = (guess + standard_sidereal_time / TWOPI + sidereal_time_offset) * sidereal_year / (sidereal_year + 1);
    sidereal_time = (((sidereal_year + 1) / sidereal_year * time - sidereal_time_offset) % 1) * TWOPI;

    if (polar_radius != 0 && equatorial_radius != 0) {
        geocentric_latitude = Math.atan(polar_radius * polar_radius / equatorial_radius * equatorial_radius * Math.tan(local_latitude));
        cosine = Math.cos(geocentric_latitude);
        sine = Math.sin(geocentric_latitude);
        earth_radius = equatorial_radius * polar_radius / Math.sqrt(polar_radius * polar_radius * cosine * cosine + equatorial_radius * equatorial_radius * sine * sine);
    }

    for (let i = 0; i < 20; i++) {
        if (polar_radius != 0 && equatorial_radius != 0) {
            let x = earth_radius * cosine * Math.cos(sidereal_time);
            let y = earth_radius * cosine * Math.sin(sidereal_time);
            let z = earth_radius * sine;
            observer_equatorial_coordinates = [x, y, z];
        }

        earth_coords = calculate_planet(earth);
        sun_coords = calculate_sun_equatorial();
        sun_coords = [sun_coords[0] - observer_equatorial_coordinates[0], sun_coords[1] - observer_equatorial_coordinates[1], sun_coords[2] - observer_equatorial_coordinates[2]];
        right_ascension = Math.atan2(sun_coords[1], sun_coords[0]);
        hour_angle = 0;
        if (mode == -1) {
            hour_angle = PI;
        }
        standard_sidereal_time = hour_angle + right_ascension - local_longitude;
        guess = Math.round(set_date * (sidereal_year + 1) / sidereal_year - sidereal_time_offset);
        time = (guess + standard_sidereal_time / TWOPI + sidereal_time_offset) * sidereal_year / (sidereal_year + 1);
        sidereal_time = (((sidereal_year + 1) / sidereal_year * time - sidereal_time_offset) % 1) * TWOPI;
    }
    let result = (time % 1) * hours + timezone;
    if (no_timezone) {
        result = (time % 1) * hours + local_longitude / TWOPI * hours;
    }
    if (result < 0) {
        result += hours;
    } else if (result > hours) {
        result -= hours;
    }
    return result;
}

function initialize() {
    equatorial_radius = Math.abs(document.getElementById("eq_radius_value").value);
    polar_radius = Math.abs(document.getElementById("polar_radius_value").value);
    let sma = Math.abs(document.getElementById("SMA_value").value);
    sidereal_year = Math.abs(document.getElementById("year_value").value);
    let ecc = Math.abs(document.getElementById("eccentricity_value").value);
    if (ecc < 0) {
        ecc = 0;
    } else if (ecc > 0.999) {
        ecc = 0.999;
    }
    axial_tilt = document.getElementById("tilt_value").value * PI / 180;
    let aop = document.getElementById("AOP_value").value * PI / 180 - PI;
    if (aop < 0) {
        aop += TWOPI;
    }
    let offset = -1 * document.getElementById("offset_value").value / sidereal_year * TWOPI;
    earth = ["Earth", sma, sidereal_year, ecc, 0, aop, 0, offset];
    hours = Math.abs(Math.floor(document.getElementById("hours_value").value));
    twilight_increment = Math.abs(document.getElementById("twilight_value").value);

    local_latitude = document.getElementById("lat_value").value * PI / 180;
    local_longitude = document.getElementById("long_value").value * PI / 180;
    if (local_longitude < 0) {
        local_longitude += TWOPI;
    }
    set_date = Math.floor(document.getElementById("date_value").value);
    no_timezone = false;
    timezone = Math.floor(document.getElementById("timezone_value").value);
    if (timezone > hours) {
        timezone -= hours;
    } else if (timezone < -hours) {
        timezone += hours;
    }
    if (document.getElementById("auto_timezone").checked) {
        timezone = Math.floor((local_longitude + PI / hours) / (TWOPI / hours));
        if (local_longitude > PI) {
            timezone -= hours;
        }
    }
    if (document.getElementById("local_time").checked) {
        no_timezone = true;
    }
    redraw();
}

function download() {
    let string = `${local_latitude * 180 / PI}, ${local_longitude * 180 / PI}, ${set_date}dy.png`;
    save(final_output, string);
}

function make_stats() {
    document.getElementById("stats").innerHTML = "";
    for (let i = 0; i < solar_terms.length; i++) {
        if (solar_terms[i] < 0) {
            solar_terms += sidereal_year;
        }
        solar_terms[i] = Math.floor(solar_terms[i]);
    }
    let solar_terms_table = `<table>
        <tr>
            <th> Lichun / Imbolc </th>
            <td> ${solar_terms[0]} dy </td>
        </tr>
        <tr>
            <th> Vernal Equinox </th>
            <td> ${solar_terms[1]} dy </td>
        </tr>
        <tr>
            <th> Lixia / Bealtaine </th>
            <td> ${solar_terms[2]} dy </td>
        </tr>
        <tr>
            <th> Northern Solstice </th>
            <td> ${solar_terms[3]} dy </td>
        </tr>
        <tr>
            <th> Liqiu / Lunasa </th>
            <td> ${solar_terms[4]} dy </td>
        </tr>
        <tr>
            <th> Autumnal Equinox </th>
            <td> ${solar_terms[5]} dy </td>
        </tr>
        <tr>
            <th> Lidong / Samhain </th>
            <td> ${solar_terms[6]} dy </td>
        </tr>
        <tr>
            <th> Southern Solstice </th>
            <td> ${solar_terms[7]} dy </td>
        </tr> </table>`

    let twilights = [-3, -2, -1, 0, 0, -1, -2, -3];
    let twilight_times = [];
    for (let i = 0; i < twilights.length; i++) {
        if (i < 4) {
            twilight_times.push(calculate_altitude(twilight_increment * twilights[i] * PI / 180, -1));
        } else {
            twilight_times.push(calculate_altitude(twilight_increment * twilights[i] * PI / 180, 1));
        }
    }

    let twilights_table = `<table style="margin-left:10px;">
        <tr>
            <th> Begin Astro. Twilight </th>
            <td> ${convert_to_sex(twilight_times[0])} </td>
        </tr>
        <tr>
            <th> Begin Naut. Twilight </th>
            <td> ${convert_to_sex(twilight_times[1])} </td>
        </tr>
        <tr>
            <th> Begin Civil Twilight </th>
            <td> ${convert_to_sex(twilight_times[2])} </td>
        </tr>
        <tr>
            <th> Sunrise </th>
            <td> ${convert_to_sex(twilight_times[3])} </td>
        </tr>
        <tr>
            <th> Solar Noon </th>
            <td> ${convert_to_sex(calculate_meridian_pass(0))} </td>
        </tr>
        <tr>
            <th> Sunset </th>
            <td> ${convert_to_sex(twilight_times[4])} </td>
        </tr>
        <tr>
            <th> End Civil Twilight </th>
            <td> ${convert_to_sex(twilight_times[5])} </td>
        </tr>
        <tr>
            <th> End Naut. Twilight </th>
            <td> ${convert_to_sex(twilight_times[6])} </td>
        </tr>
        <tr>
            <th> End Astro. Twilight </th>
            <td> ${convert_to_sex(twilight_times[7])} </td>
        </tr>
        <tr>
            <th> Solar Midnight </th>
            <td> ${convert_to_sex(calculate_meridian_pass(-1))} </td>
        </tr> </table>`
    document.getElementById("stats").innerHTML += solar_terms_table;
    document.getElementById("stats").innerHTML += twilights_table;
}

function convert_to_sex(x) {
    let h = Math.floor(x);
    let m = x - h;
    m = Math.floor(m * 60);
    let s = Math.round((x - h - m / 60) * 3600);
    return `${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`
}
