// Generated by CoffeeScript 1.6.2 - MODIFIED OUT OF SYNC WITH COFFEE
(function() {
  var angleString, deltaVAbbr, distanceString, ejectionDeltaVInfoContent, numberWithCommas, porkchopPlot, selectedTransfer, showTransferDetails, showTransferDetailsForPoint, sign;

  porkchopPlot = null;

  selectedTransfer = null;

  sign = function(x) {
    if (x < 0) {
      return -1;
    } else {
      return 1;
    }
  };

  numberWithCommas = function(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  distanceString = function(d) {
    if (Math.abs(d) > 1e12) {
      return numberWithCommas((d / 1e9).toFixed()) + " Gm";
    } else if (Math.abs(d) >= 1e9) {
      return numberWithCommas((d / 1e6).toFixed()) + " Mm";
    } else if (Math.abs(d) >= 1e6) {
      return numberWithCommas((d / 1e3).toFixed()) + " km";
    } else {
      return numberWithCommas(d.toFixed()) + " m";
    }
  };

  deltaVAbbr = function(el, dv, prograde, normal, radial) {
    var tooltip;

    tooltip = numberWithCommas(prograde.toFixed(1)) + " m/s prograde; " + numberWithCommas(normal.toFixed(1)) + " m/s normal";
    if (radial != null) {
      tooltip += "; " + numberWithCommas(radial.toFixed(1)) + " m/s radial";
    }
    return el.attr({
      title: tooltip
    }).text(numberWithCommas(dv.toFixed()) + " m/s");
  };

  angleString = function(angle, precision) {
    if (precision == null) {
      precision = 0;
    }
    return (angle * 180 / Math.PI).toFixed(precision) + String.fromCharCode(0x00b0);
  };

  showTransferDetailsForPoint = function(point) {
    var dt, mission, t0, transfer, x, y, _ref;

    mission = porkchopPlot.mission;
    _ref = [point.x, point.y], x = _ref[0], y = _ref[1];
    t0 = mission.earliestDeparture + x * mission.xResolution;
    dt = mission.shortestTimeOfFlight + y * mission.yResolution;
    transfer = Orbit.transfer(mission.transferType, mission.originBody, mission.destinationBody, t0, dt, mission.initialOrbitalVelocity, mission.finalOrbitalVelocity);
    return showTransferDetails(transfer, t0, dt);
  };

  showTransferDetails = function(transfer, t0, dt) {
    var destinationOrbit, ejectionAngle, mission, originOrbit, t1;

    mission = porkchopPlot.mission;
    t1 = t0 + dt;
    transfer = Orbit.transferDetails(transfer, mission.originBody, t0, mission.initialOrbitalVelocity);
    selectedTransfer = transfer;
    originOrbit = mission.originBody.orbit;
    destinationOrbit = mission.destinationBody.orbit;
    
    
    var transferOrbitClone = JSON.parse( JSON.stringify( transfer.orbit ) );
    delete transferOrbitClone.referenceBody;
    
    
    var foo = {
      originBody: mission.originBody.name(),
      destinationBody: mission.destinationBody.name(),
      referenceBody: transfer.orbit.referenceBody.name(),
      
      departureTime: t0,
      arrivalTime: t1,
      
      transferOrbit: transferOrbitClone
    };
    alex( foo );
    
    
    $('#departureTime').text(new KerbalTime(t0).toDateString()).attr({
      title: "UT: " + (t0.toFixed()) + "s"
    });
    $('#arrivalTime').text(new KerbalTime(t1).toDateString()).attr({
      title: "UT: " + (t1.toFixed()) + "s"
    });
    $('#timeOfFlight').text(new KerbalTime(dt).toDurationString()).attr({
      title: dt.toFixed() + "s"
    });
    $('#phaseAngle').text(angleString(originOrbit.phaseAngle(destinationOrbit, t0), 2));
    if (transfer.ejectionAngle != null) {
      $('.ejectionAngle').show();
      if (destinationOrbit.semiMajorAxis < originOrbit.semiMajorAxis) {
        ejectionAngle = transfer.ejectionAngle - Math.PI;
        if (ejectionAngle < 0) {
          ejectionAngle += 2 * Math.PI;
        }
        $('#ejectionAngle').text(angleString(ejectionAngle) + " to retrograde");
      } else {
        $('#ejectionAngle').text(angleString(transfer.ejectionAngle) + " to prograde");
      }
    } else {
      $('.ejectionAngle').hide();
    }
    $('#ejectionDeltaV').text(numberWithCommas(transfer.ejectionDeltaV.toFixed()) + " m/s");
    $('#ejectionDeltaVInfo').popover('hide');
    $('#transferPeriapsis').text(distanceString(transfer.orbit.periapsisAltitude()));
    $('#transferApoapsis').text(distanceString(transfer.orbit.apoapsisAltitude()));
    $('#transferInclination').text(angleString(transfer.orbit.inclination, 2));
    $('#transferAngle').text(angleString(transfer.angle));
    if (transfer.planeChangeTime != null) {
      $('.ballisticTransfer').hide();
      $('.planeChangeTransfer').show();
      $('#planeChangeTime').text(new KerbalTime(transfer.planeChangeTime).toDateString()).attr({
        title: "UT: " + (transfer.planeChangeTime.toFixed()) + "s"
      });
      $('#planeChangeAngleToIntercept').text(angleString(transfer.planeChangeAngleToIntercept, 2));
      $('#planeChangeAngle').text(angleString(transfer.planeChangeAngle, 2));
      deltaVAbbr($('#planeChangeDeltaV'), transfer.planeChangeDeltaV, -transfer.planeChangeDeltaV * Math.abs(Math.sin(transfer.planeChangeAngle / 2)), transfer.planeChangeDeltaV * sign(transfer.planeChangeAngle) * Math.cos(transfer.planeChangeAngle / 2));
    } else {
      $('.planeChangeTransfer').hide();
      $('.ballisticTransfer').show();
      $('#ejectionInclination').text(angleString(transfer.ejectionInclination, 2));
    }
    if (transfer.insertionInclination != null) {
      $('#insertionInclination').text(angleString(transfer.insertionInclination, 2));
    } else {
      $('#insertionInclination').text("N/A");
    }
    if (transfer.insertionDeltaV !== 0) {
      $('#insertionDeltaV').text(numberWithCommas(transfer.insertionDeltaV.toFixed()) + " m/s");
    } else {
      $('#insertionDeltaV').text("N/A");
    }
    $('#totalDeltaV').text(numberWithCommas(transfer.deltaV.toFixed()) + " m/s");
    return $('#transferDetails:hidden').fadeIn();
  };

  ejectionDeltaVInfoContent = function() {
    var list;

    list = $("<dl>");
    $("<dt>").text("Prograde \u0394v").appendTo(list);
    $("<dd>").text(numberWithCommas(selectedTransfer.ejectionProgradeDeltaV.toFixed(1)) + " m/s").appendTo(list);
    $("<dt>").text("Normal \u0394v").appendTo(list);
    $("<dd>").text(numberWithCommas(selectedTransfer.ejectionNormalDeltaV.toFixed(1)) + " m/s").appendTo(list);
    if (selectedTransfer.ejectionRadialDeltaV != null) {
      $("<dt>").text("Radial \u0394v").appendTo(list);
      $("<dd>").text(numberWithCommas(selectedTransfer.ejectionRadialDeltaV.toFixed(1)) + " m/s").appendTo(list);
    }
    $("<dd>").html("&nbsp;").appendTo(list);
    if (selectedTransfer.ejectionPitch != null) {
      $("<dt>").text("Pitch").appendTo(list);
      $("<dd>").text(angleString(selectedTransfer.ejectionPitch, 2)).appendTo(list);
    }
    $("<dt>").text("Heading").appendTo(list);
    $("<dd>").text(angleString(selectedTransfer.ejectionHeading, 2)).appendTo(list);
    return list;
  };

  $(document).ready(function() {
    var celestialBodyForm, missionForm;

    celestialBodyForm = new CelestialBodyForm($('#bodyForm'));
    missionForm = new MissionForm($('#porkchopForm'), celestialBodyForm);
    porkchopPlot = new PorkchopPlot($('#porkchopContainer'));
    $(KerbalTime).on('dateFormatChanged', function(event) {
      if (porkchopPlot.selectedPoint != null) {
        return showTransferDetailsForPoint(porkchopPlot.selectedPoint);
      }
    });
    $(missionForm).on('submit', function(event) {
      var scrollTop;

      $('#porkchopSubmit,#refineTransferBtn').prop('disabled', true);
      scrollTop = $('#porkchopCanvas').offset().top + $('#porkchopCanvas').height() - $(window).height();
      if ($(document).scrollTop() < scrollTop) {
        $("html,body").animate({
          scrollTop: scrollTop
        }, 500);
      }
      return porkchopPlot.calculate(missionForm.mission(), true);
    });
    $(porkchopPlot).on('plotStarted', function(event) {
      return $('#porkchopSubmit').prop('disabled', true);
    }).on('plotComplete', function(event) {
      showTransferDetailsForPoint(porkchopPlot.selectedPoint);
      return $('#porkchopSubmit,#refineTransferBtn').prop('disabled', false);
    }).on('click', function(event, point) {
      return showTransferDetailsForPoint(point);
    });
    $('#ejectionDeltaVInfo').popover({
      html: true,
      content: ejectionDeltaVInfoContent
    }).click(function(event) {
      return event.preventDefault();
    }).on('show.bs.popover', function() {
      return $(this).next().find('.popover-content').html(ejectionDeltaVInfoContent());
    });
    return $('#refineTransferBtn').click(function(event) {
      var dt, mission, t0, transfer, x, y, _ref;

      _ref = [porkchopPlot.selectedPoint.x, porkchopPlot.selectedPoint.y], x = _ref[0], y = _ref[1];
      mission = porkchopPlot.mission;
      t0 = mission.earliestDeparture + x * mission.xResolution;
      dt = mission.shortestTimeOfFlight + y * mission.yResolution;
      transfer = Orbit.refineTransfer(selectedTransfer, mission.transferType, mission.originBody, mission.destinationBody, t0, dt, mission.initialOrbitalVelocity, mission.finalOrbitalVelocity);
      return showTransferDetails(transfer, t0, dt);
    });
  });

  // key binding
  document.addEventListener('keydown', function(e) {
    if (porkchopPlot.selectedPoint == null)
      return;
    
    var point_moved = false;
    var x = porkchopPlot.selectedPoint.x;
    var y = porkchopPlot.selectedPoint.y;
    switch (e.keyCode)
    {
       case 87: // W
          if( y < 299 ) y ++;
          point_moved = true;
          break;
       case 83: // S
          if( y >0 ) y --;
          point_moved = true;
          break;
       case 65: // A
          if( x >0 ) x --;
          point_moved = true;
          break;
       case 68: // D
          if( x < 299 ) x ++;
          point_moved = true;
          break;
    }
    
    if( point_moved ) {
      //showTransferDetailsForPoint(porkchopPlot.selectedPoint);
      porkchopPlot.selectPoint( x, y );
      $(porkchopPlot).trigger('click', porkchopPlot.selectedPoint);
    }
  }, false);
  
}).call(this);
